package com.example.aema2ui.agent;

import com.embabel.agent.api.annotation.Action;
import com.embabel.agent.api.annotation.AchievesGoal;
import com.embabel.agent.api.annotation.Agent;
import com.embabel.agent.api.common.Ai;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.model.UserInput;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Embabel Agent for generating AEM content suggestions.
 *
 * Uses Embabel 1.0.0 Ai API for LLM integration.
 * The GOAP planner automatically determines execution order:
 * parseUserIntent -> generateContent
 */
@Slf4j
@Component
@Agent(description = "AI agent that generates content suggestions for AEM components")
public class AemContentAgent {

    private final ObjectMapper objectMapper;

    public static final String BRAND_GUIDELINES = """
        BRAND: Acme Corp - Professional, Innovative, Trustworthy
        HEADLINES: Action verbs (Transform, Discover, Unlock), max 6 words
        COPY: Clear, scannable, under 150 chars
        CTAs: "Start Free Trial", "See It In Action", "Explore Now"
        AVOID: Jargon, passive voice, "best/leading"
        """;

    public AemContentAgent(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Parse user input to understand their intent.
     * Uses keyword fast-path for common cases, LLM for complex inputs.
     */
    @Action(description = "Parse user request to detect component type, audience, and tone")
    public UserInput parseUserIntent(String rawInput, Ai ai) {
        log.info("Parsing user intent from: {}", rawInput);

        String input = rawInput != null ? rawInput.toLowerCase() : "";
        String detectedType = detectComponentType(input);

        // Fast path: skip LLM for common component types
        if (!detectedType.equals("general")) {
            log.info("Fast path: detected component type '{}' from keywords", detectedType);
            return UserInput.builder()
                .rawText(rawInput)
                .detectedComponentType(detectedType)
                .targetAudience("general audience")
                .brandStyle("professional and modern")
                .toneOfVoice("professional yet approachable")
                .build();
        }

        // Use Embabel Ai for complex/ambiguous inputs
        log.info("Using LLM for intent parsing (complex input)");
        String prompt = """
            Extract from this user request a JSON object with these fields:
            - detectedComponentType: one of "hero", "product", "teaser", "banner", "general"
            - targetAudience: the target audience mentioned or "general audience"
            - brandStyle: any style mentioned or "professional and modern"
            - toneOfVoice: tone requested or "professional yet approachable"

            User request: %s

            Reply ONLY with the JSON object, no other text.
            """.formatted(rawInput);

        String llmResponse = ai.withAutoLlm().generateText(prompt);
        return parseUserInputJson(llmResponse, rawInput);
    }

    /**
     * Generate content suggestion based on parsed user input.
     * Uses Embabel Ai for content generation.
     */
    @AchievesGoal(description = "Content suggestion generated for AEM component")
    @Action(description = "Generate branded content suggestion using LLM")
    public ContentSuggestion generateContent(UserInput input, Ai ai) {
        log.info("Generating content for component type: {}", input.getDetectedComponentType());

        String componentType = input.getDetectedComponentType() != null
            ? input.getDetectedComponentType()
            : "general";

        String audience = input.getTargetAudience() != null
            ? input.getTargetAudience()
            : "general audience";
        String brandStyle = input.getBrandStyle() != null
            ? input.getBrandStyle()
            : "professional and modern";
        String tone = input.getToneOfVoice() != null
            ? input.getToneOfVoice()
            : "professional yet approachable";

        String prompt = """
            %s

            Generate %s content for: %s
            Audience: %s | Style: %s | Tone: %s

            Reply ONLY with this JSON (no other text):
            {"title":"short headline","subtitle":"value prop","description":"brief copy under 150 chars","ctaText":"action button","ctaUrl":"/path","imageUrl":"https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200","componentType":"%s"}
            """.formatted(BRAND_GUIDELINES, componentType, input.getRawText(), audience, brandStyle, tone, componentType);

        String llmResponse = ai.withAutoLlm().generateText(prompt);
        ContentSuggestion suggestion = parseContentSuggestionJson(llmResponse, componentType);

        log.info("Generated content: {}", suggestion.getTitle());
        return suggestion;
    }

    /**
     * Generate content using templates only (no LLM).
     */
    public ContentSuggestion generateTemplateContent(String rawInput, String componentType) {
        String type = componentType != null && !componentType.isEmpty()
            ? componentType
            : detectComponentType(rawInput.toLowerCase());
        ContentSuggestion suggestion = createTemplateSuggestion(type, rawInput);
        suggestion.setComponentType(type);
        log.info("Template-only content generated for type: {}", type);
        return suggestion;
    }

    private String detectComponentType(String input) {
        if (input.contains("hero")) return "hero";
        if (input.contains("product")) return "product";
        if (input.contains("teaser")) return "teaser";
        if (input.contains("banner")) return "banner";
        return "general";
    }

    private String getDefaultImageUrl(String componentType) {
        return switch (componentType.toLowerCase()) {
            case "hero" -> "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200";
            case "product" -> "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
            case "teaser" -> "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600";
            case "banner" -> "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200";
            default -> "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800";
        };
    }

    private UserInput parseUserInputJson(String llmResponse, String rawInput) {
        try {
            String json = cleanJsonResponse(llmResponse);
            JsonNode node = objectMapper.readTree(json);
            return UserInput.builder()
                .rawText(rawInput)
                .detectedComponentType(node.path("detectedComponentType").asText("general"))
                .targetAudience(node.path("targetAudience").asText("general audience"))
                .brandStyle(node.path("brandStyle").asText("professional and modern"))
                .toneOfVoice(node.path("toneOfVoice").asText("professional yet approachable"))
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse LLM response as UserInput, falling back to keyword detection: {}", e.getMessage());
            return UserInput.builder()
                .rawText(rawInput)
                .detectedComponentType(detectComponentType(rawInput.toLowerCase()))
                .targetAudience("general audience")
                .brandStyle("professional and modern")
                .toneOfVoice("professional yet approachable")
                .build();
        }
    }

    private ContentSuggestion parseContentSuggestionJson(String llmResponse, String componentType) {
        try {
            String json = cleanJsonResponse(llmResponse);
            JsonNode node = objectMapper.readTree(json);
            return ContentSuggestion.builder()
                .title(node.path("title").asText("Untitled"))
                .subtitle(node.path("subtitle").asText(""))
                .description(node.path("description").asText(""))
                .ctaText(node.path("ctaText").asText("Learn More"))
                .ctaUrl(node.path("ctaUrl").asText("#"))
                .imageUrl(node.path("imageUrl").asText(getDefaultImageUrl(componentType)))
                .componentType(componentType)
                .build();
        } catch (Exception e) {
            log.warn("Failed to parse LLM response as ContentSuggestion, using templates: {}", e.getMessage());
            return createTemplateSuggestion(componentType, llmResponse);
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

    // Template variations for fallback
    private static final String[][] HERO_TEMPLATES = {
        {"Transform Your Digital Experience", "Innovation Meets Simplicity", "Empower your team with tools designed for the modern enterprise.", "See It In Action", "/demo"},
        {"Unlock Your Team's Potential", "Speed & Efficiency Redefined", "Accelerate productivity with seamless workflow automation.", "Start Free Trial", "/trial"},
        {"Elevate Your Business Today", "Enterprise-Grade Solutions", "Scale confidently with security and performance built-in.", "Get Started", "/start"}
    };

    private static final String[][] PRODUCT_TEMPLATES = {
        {"Enterprise Security Suite", "Protection That Scales", "Zero-trust security trusted by Fortune 500 companies.", "Start Free Trial", "/pricing"},
        {"Workflow Automation Pro", "Automate Everything", "Build powerful automations without writing code.", "Try It Free", "/pricing"},
        {"Analytics Dashboard Plus", "Insights in Real-Time", "Make data-driven decisions with live dashboards.", "Get Started", "/pricing"}
    };

    private static final String[][] TEASER_TEMPLATES = {
        {"Seamless Integrations", "Connect Your Stack", "One-click integrations with 200+ enterprise tools.", "Learn More", "/integrations"},
        {"Real-Time Analytics", "Data at Your Fingertips", "Track KPIs and metrics that matter most.", "See Features", "/analytics"},
        {"Enterprise Security", "Bank-Grade Protection", "SOC 2 certified with end-to-end encryption.", "View Security", "/security"}
    };

    private static final String[][] BANNER_TEMPLATES = {
        {"Limited Time: 30% Off Annual Plans", "Enterprise-Ready Today", "Join 10,000+ companies already transforming.", "Claim Offer", "/pricing"},
        {"New Feature: AI-Powered Insights", "Smarter Decisions Faster", "Discover patterns humans miss with ML analytics.", "Try It Now", "/ai-features"},
        {"Product Update: v3.0 Released", "Faster. Smarter. Better.", "50+ new features and 2x performance boost.", "See What's New", "/changelog"}
    };

    private ContentSuggestion createTemplateSuggestion(String componentType, String rawInput) {
        String[][] templates = switch (componentType.toLowerCase()) {
            case "hero" -> HERO_TEMPLATES;
            case "product" -> PRODUCT_TEMPLATES;
            case "teaser" -> TEASER_TEMPLATES;
            case "banner" -> BANNER_TEMPLATES;
            default -> HERO_TEMPLATES;
        };

        int index = Math.abs(rawInput.hashCode()) % templates.length;
        String[] t = templates[index];

        ContentSuggestion.ContentSuggestionBuilder builder = ContentSuggestion.builder()
            .title(t[0])
            .subtitle(t[1])
            .description(t[2])
            .ctaText(t[3])
            .ctaUrl(t[4])
            .imageUrl(getDefaultImageUrl(componentType))
            .imageAlt(t[0]);

        if ("product".equals(componentType)) {
            builder.price("$99/mo");
        }

        return builder.build();
    }
}
