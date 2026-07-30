package com.example.aema2ui.service;

import com.example.aema2ui.agent.AemContentAgent;
import com.example.aema2ui.model.ContentSuggestion;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service that generates content suggestions using the Embabel Agent runtime.
 *
 * Uses AgentInvocation to run the AemContentAgent through the GOAP planner.
 * The planner automatically chains: parseUserIntent -> generateContent
 */
@Slf4j
@Service
public class ContentSuggestionService {

    private final A2UIMessageBuilder builder;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;
    private final AemContentAgent contentAgent;

    @Value("${aem.agent.ai.enabled:false}")
    private boolean aiEnabled;

    @Value("${aem.agent.suggestions.count:1}")
    private int suggestionsCount;

    public ContentSuggestionService(A2UIMessageBuilder builder, LlmService llmService, ObjectMapper objectMapper, AemContentAgent contentAgent) {
        this.builder = builder;
        this.llmService = llmService;
        this.objectMapper = objectMapper;
        this.contentAgent = contentAgent;
    }

    /**
     * Result record for multiple suggestions.
     */
    public record SuggestionsResult(List<Map<String, Object>> messages, List<Map<String, Object>> artifacts) {}

    /**
     * Generates multiple content suggestions using the Embabel Agent runtime.
     * The GOAP planner orchestrates: parseUserIntent -> generateContent
     */
    public SuggestionsResult generateMultipleSuggestions(String userInput, int count) {
        List<Map<String, Object>> messages = new ArrayList<>();
        List<Map<String, Object>> artifacts = new ArrayList<>();

        // Use Embabel Agent runtime to generate the first suggestion
        ContentSuggestion firstSuggestion = generateContentViaAgent(userInput);

        // Generate additional variations with different styles
        List<ContentSuggestion> suggestions = new ArrayList<>();
        suggestions.add(firstSuggestion);

        String[] styles = {"bold and impactful", "friendly and conversational", "professional and elegant"};
        for (int i = 1; i < count && i < styles.length; i++) {
            try {
                String variantInput = userInput + " (Style: " + styles[i] + ")";
                suggestions.add(generateContentViaAgent(variantInput));
            } catch (Exception e) {
                log.warn("Failed to generate variation {}: {}", i, e.getMessage());
            }
        }

        // Create artifacts
        for (int i = 0; i < suggestions.size(); i++) {
            artifacts.add(createArtifact(suggestions.get(i), i + 1));
        }

        // Build A2UI messages for the first suggestion
        if (!suggestions.isEmpty()) {
            String surfaceId = "suggestion_" + UUID.randomUUID().toString().substring(0, 8);
            messages.add(builder.beginRendering(surfaceId, "root"));
            messages.add(builder.surfaceUpdate(surfaceId, buildComponents(suggestions.get(0))));
            messages.add(builder.dataModelUpdate(surfaceId, "suggestion", buildDataModel(suggestions.get(0))));
        }

        return new SuggestionsResult(messages, artifacts);
    }

    /**
     * Generate a single content suggestion via the Embabel Agent runtime.
     * The GOAP planner handles: parseUserIntent(String) -> generateContent(UserInput)
     * Falls back to template-based generation if agent invocation fails.
     */
    private ContentSuggestion generateContentViaAgent(String userInput) {
        if (llmService.isEnabled()) {
            log.info("Generating content via LLM");
            try {
                String prompt = AemContentAgent.BRAND_GUIDELINES + "\n\nGenerate " + userInput +
                    " content. Reply ONLY with JSON: {\"title\":\"...\",\"subtitle\":\"...\",\"description\":\"...\",\"ctaText\":\"...\",\"ctaUrl\":\"/...\",\"imageUrl\":\"...\",\"componentType\":\"...\"}";
                ContentSuggestion result = llmService.generateObject(prompt, ContentSuggestion.class);
                if (result != null) {
                    return result;
                }
            } catch (Exception e) {
                log.warn("LLM invocation failed, falling back to templates: {}", e.getMessage());
            }
        }
        return contentAgent.generateTemplateContent(userInput, null);
    }

    /**
     * Generates A2UI messages based on user input.
     */
    public List<Map<String, Object>> generateSuggestion(String userInput) {
        String surfaceId = "suggestion_" + UUID.randomUUID().toString().substring(0, 8);

        // Generate content via agent runtime
        ContentSuggestion suggestion = generateContentViaAgent(userInput);

        // Build A2UI messages
        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(builder.beginRendering(surfaceId, "root"));
        messages.add(builder.surfaceUpdate(surfaceId, buildComponents(suggestion)));
        messages.add(builder.dataModelUpdate(surfaceId, "suggestion", buildDataModel(suggestion)));

        return messages;
    }

    /**
     * Create an artifact containing the suggestion data.
     */
    private Map<String, Object> createArtifact(ContentSuggestion suggestion, int index) {
        try {
            String json = objectMapper.writeValueAsString(suggestion);
            return Map.of(
                "index", index,
                "name", "suggestion_" + index,
                "parts", List.of(Map.of(
                    "type", "application/json",
                    "data", json
                ))
            );
        } catch (Exception e) {
            log.error("Failed to serialize suggestion", e);
            return Map.of("error", e.getMessage());
        }
    }

    /**
     * Builds the component tree for the suggestion UI.
     */
    private List<Map<String, Object>> buildComponents(ContentSuggestion suggestion) {
        List<Map<String, Object>> components = new ArrayList<>();

        components.add(builder.column("root", List.of("header", "preview", "form", "actions")));

        String headerText = "Content Suggestion" +
            (suggestion.getComponentType() != null ? " (" + suggestion.getComponentType() + ")" : "");
        components.add(builder.text("header", headerText, "h2"));

        components.add(builder.image("preview", "/suggestion/imageUrl", "Preview image"));

        List<String> formFields = new ArrayList<>(List.of("title_field", "subtitle_field", "desc_field"));
        if (suggestion.getPrice() != null) {
            formFields.add("price_field");
        }
        formFields.add("cta_field");
        components.add(builder.column("form", formFields));

        components.add(builder.textField("title_field", "Title", "/suggestion/title", null));
        components.add(builder.textField("subtitle_field", "Subtitle", "/suggestion/subtitle", null));
        components.add(builder.textField("desc_field", "Description", "/suggestion/description", 3));

        if (suggestion.getPrice() != null) {
            components.add(builder.textField("price_field", "Price", "/suggestion/price", null));
        }

        components.add(builder.textField("cta_field", "Button Text", "/suggestion/ctaText", null));
        components.add(builder.row("actions", List.of("apply_btn", "regenerate_btn")));
        components.add(builder.button("apply_btn", "Apply to Component", "apply_suggestion"));
        components.add(builder.button("regenerate_btn", "Try Again", "regenerate"));

        return components;
    }

    /**
     * Builds the data model for the suggestion.
     */
    private List<Map<String, Object>> buildDataModel(ContentSuggestion suggestion) {
        List<Map<String, Object>> data = new ArrayList<>();

        data.add(builder.dataString("title", suggestion.getTitle()));
        data.add(builder.dataString("subtitle", suggestion.getSubtitle() != null ? suggestion.getSubtitle() : ""));
        data.add(builder.dataString("description", suggestion.getDescription()));
        data.add(builder.dataString("imageUrl", suggestion.getImageUrl()));
        data.add(builder.dataString("ctaText", suggestion.getCtaText() != null ? suggestion.getCtaText() : "Learn More"));
        data.add(builder.dataString("ctaUrl", suggestion.getCtaUrl() != null ? suggestion.getCtaUrl() : "#"));

        if (suggestion.getPrice() != null) {
            data.add(builder.dataString("price", suggestion.getPrice()));
        }

        return data;
    }
}
