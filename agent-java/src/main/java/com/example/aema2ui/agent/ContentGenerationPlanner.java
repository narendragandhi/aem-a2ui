package com.example.aema2ui.agent;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.AchievesGoal;
import com.embabel.agent.api.annotation.Agent;
import com.embabel.agent.api.common.Ai;
import com.example.aema2ui.agent.tool.DamSearchTool;
import com.example.aema2ui.agent.tool.SeoAnalysisTool;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.model.DamSearchResult;
import com.example.aema2ui.model.PlanningContext;
import com.example.aema2ui.model.SeoValidationResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Embabel GOAP Planner for multi-step AEM content generation.
 *
 * Demonstrates Embabel's Goal-Oriented Action Planning (GOAP):
 * - The planner automatically chains actions based on input/output types
 * - Actions: parseRequest -> searchDamAssets -> generateContent -> validateContent -> finalizeContent
 * - Each action produces output that feeds into subsequent actions
 * - The planner determines optimal execution order from the action graph
 *
 * Pipeline:
 *   1. Parse user request → PlanningContext (intent, component type, audience)
 *   2. Search DAM assets → DamSearchResult (relevant images)
 *   3. Generate content → ContentSuggestion (title, description, CTA)
 *   4. Validate SEO → SeoValidationResult (score, issues)
 *   5. Finalize → ContentSuggestion (with SEO scores attached)
 */
@Slf4j
@Component
@Agent(description = "Multi-step GOAP planner for generating SEO-optimized AEM content with DAM integration")
public class ContentGenerationPlanner {

    private final DamSearchTool damSearchTool;
    private final SeoAnalysisTool seoAnalysisTool;
    private final ObjectMapper objectMapper;

    public ContentGenerationPlanner(DamSearchTool damSearchTool, SeoAnalysisTool seoAnalysisTool,
                                     ObjectMapper objectMapper) {
        this.damSearchTool = damSearchTool;
        this.seoAnalysisTool = seoAnalysisTool;
        this.objectMapper = objectMapper;
    }

    /**
     * Step 1: Parse the user's raw request into a structured PlanningContext.
     * Determines component type, target audience, and whether DAM search is needed.
     */
    @Action(description = "Parse user request to determine component type, audience, and DAM requirements")
    public PlanningContext parseRequest(String rawInput, Ai ai) {
        log.info("GOAP Step 1: Parsing request '{}'", rawInput);

        String input = rawInput != null ? rawInput.toLowerCase() : "";
        String componentType = detectComponentType(input);

        // Fast path for common types
        if (!componentType.equals("general")) {
            log.info("Fast path: detected '{}' from keywords", componentType);
            return PlanningContext.builder()
                .rawInput(rawInput)
                .componentType(componentType)
                .targetAudience("general audience")
                .brandStyle("professional and modern")
                .toneOfVoice("professional yet approachable")
                .damSearchQuery(componentType + " " + input)
                .damSearchRequired(true)
                .build();
        }

        // Use LLM for complex/ambiguous inputs
        String prompt = """
            Analyze this request and return ONLY a JSON object:
            {"componentType":"hero|product|teaser|banner|general","targetAudience":"...","brandStyle":"...","toneOfVoice":"...","damSearchRequired":true,"damSearchQuery":"search terms for stock images"}

            Request: %s
            """.formatted(rawInput);

        String llmResponse = ai.withAutoLlm().generateText(prompt);
        return parsePlanningContextJson(llmResponse, rawInput);
    }

    /**
     * Step 2: Search AEM DAM for relevant assets based on the planning context.
     */
    @Action(description = "Search AEM DAM for images and assets matching the content requirements")
    public DamSearchResult searchDamAssets(PlanningContext context) {
        log.info("GOAP Step 2: Searching DAM for '{}'", context.getDamSearchQuery());
        return damSearchTool.search(context.getDamSearchQuery(), context.getComponentType());
    }

    /**
     * Step 3: Generate content suggestion using parsed intent and DAM assets.
     */
    @AchievesGoal(description = "SEO-optimized AEM content suggestion generated with DAM assets")
    @Action(description = "Generate branded content using LLM with DAM asset context")
    public ContentSuggestion generateContent(PlanningContext context, DamSearchResult damResult, Ai ai) {
        log.info("GOAP Step 3: Generating content for '{}' with {} DAM assets",
            context.getComponentType(), damResult.getTotalResults());

        // Build DAM context for the LLM
        String damContext = "";
        if (damResult.getAssets() != null && !damResult.getAssets().isEmpty()) {
            DamSearchResult.DamAsset primary = damResult.getAssets().get(0);
            damContext = "Available image: " + primary.getName() + " (" + primary.getDescription() + ") URL: " + primary.getThumbnailUrl();
        }

        String prompt = """
            %s

            Generate %s content for: %s
            Audience: %s | Style: %s | Tone: %s
            %s

            Reply ONLY with this JSON (no other text):
            {"title":"headline","subtitle":"value prop","description":"copy under 150 chars","ctaText":"button","ctaUrl":"/path","imageUrl":"use provided image URL if available","imageAlt":"descriptive alt text","componentType":"%s"}
            """.formatted(
                AemContentAgent.BRAND_GUIDELINES,
                context.getComponentType(),
                context.getRawInput(),
                context.getTargetAudience(),
                context.getBrandStyle(),
                context.getToneOfVoice(),
                damContext,
                context.getComponentType()
            );

        String llmResponse = ai.withAutoLlm().generateText(prompt);
        ContentSuggestion suggestion = parseContentSuggestion(llmResponse, context.getComponentType());

        // Use DAM image if available and LLM didn't provide one
        if ((suggestion.getImageUrl() == null || suggestion.getImageUrl().isEmpty())
                && !damResult.getAssets().isEmpty()) {
            suggestion.setImageUrl(damResult.getAssets().get(0).getThumbnailUrl());
            suggestion.setImageAlt(damResult.getAssets().get(0).getDescription());
        }

        return suggestion;
    }

    /**
     * Step 4: Validate SEO quality of the generated content.
     */
    @Action(description = "Analyze SEO quality and generate improvement recommendations")
    public SeoValidationResult validateContent(ContentSuggestion content) {
        log.info("GOAP Step 4: Validating SEO for '{}'", content.getTitle());
        return seoAnalysisTool.analyze(content);
    }

    /**
     * Step 5: Finalize content with SEO scores attached.
     */
    @Action(description = "Attach SEO scores and finalize the content suggestion")
    @AchievesGoal(description = "Content finalized with SEO validation scores")
    public ContentSuggestion finalizeContent(ContentSuggestion content, SeoValidationResult seo) {
        log.info("GOAP Step 5: Finalizing content, SEO score={}", seo.getScore());
        content.setSeoScore(seo.getScore());
        content.setSeo(String.join("; ", seo.getIssues()));
        content.setVisualScore(Math.min(100, seo.getScore() + 10));
        content.setId("goap-" + System.currentTimeMillis());
        return content;
    }

    // --- Helpers ---

    private String detectComponentType(String input) {
        if (input.contains("hero")) return "hero";
        if (input.contains("product")) return "product";
        if (input.contains("teaser")) return "teaser";
        if (input.contains("banner")) return "banner";
        return "general";
    }

    private PlanningContext parsePlanningContextJson(String llmResponse, String rawInput) {
        try {
            String json = cleanJsonResponse(llmResponse);
            JsonNode node = objectMapper.readTree(json);
            return PlanningContext.builder()
                .rawInput(rawInput)
                .componentType(node.path("componentType").asText("general"))
                .targetAudience(node.path("targetAudience").asText("general audience"))
                .brandStyle(node.path("brandStyle").asText("professional and modern"))
                .toneOfVoice(node.path("toneOfVoice").asText("professional yet approachable"))
                .damSearchQuery(node.path("damSearchQuery").asText(rawInput))
                .damSearchRequired(node.path("damSearchRequired").asBoolean(true))
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse LLM response, using keyword detection: {}", e.getMessage());
            return PlanningContext.builder()
                .rawInput(rawInput)
                .componentType(detectComponentType(rawInput.toLowerCase()))
                .targetAudience("general audience")
                .brandStyle("professional and modern")
                .toneOfVoice("professional yet approachable")
                .damSearchQuery(rawInput)
                .damSearchRequired(true)
                .build();
        }
    }

    private ContentSuggestion parseContentSuggestion(String llmResponse, String componentType) {
        try {
            String json = cleanJsonResponse(llmResponse);
            JsonNode node = objectMapper.readTree(json);
            return ContentSuggestion.builder()
                .title(node.path("title").asText("Untitled"))
                .subtitle(node.path("subtitle").asText(""))
                .description(node.path("description").asText(""))
                .ctaText(node.path("ctaText").asText("Learn More"))
                .ctaUrl(node.path("ctaUrl").asText("#"))
                .imageUrl(node.path("imageUrl").asText(""))
                .imageAlt(node.path("imageAlt").asText(""))
                .componentType(componentType)
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse content suggestion JSON: {}", e.getMessage());
            return ContentSuggestion.builder()
                .title("Generated Content")
                .subtitle("AI-powered content suggestion")
                .description("Content generated by GOAP planner")
                .ctaText("Learn More")
                .ctaUrl("#")
                .componentType(componentType)
                .build();
        }
    }

    private String cleanJsonResponse(String response) {
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        } else if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }
}
