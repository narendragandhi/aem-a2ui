package com.example.aema2ui.controller;

import com.example.aema2ui.model.PageRecommendation;
import com.example.aema2ui.model.TaskRequest;
import com.example.aema2ui.model.TaskResponse;
import com.example.aema2ui.model.BrandValidationResult;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.service.AemComponentMappingService;
import com.example.aema2ui.service.AemIntegrationService;
import com.example.aema2ui.service.AgentRecommendationService;
import com.example.aema2ui.service.BrandConfigService;
import com.example.aema2ui.service.BrandValidationService;
import com.example.aema2ui.service.ContentSuggestionService;
import com.example.aema2ui.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for the A2UI agent endpoints.
 * Implements A2A-compatible endpoints for agent discovery and task handling.
 */
@RestController
@RequiredArgsConstructor
public class AgentController {

    private final ContentSuggestionService suggestionService;
    private final AgentRecommendationService recommendationService;
    private final AemIntegrationService aemIntegrationService;
    private final AemComponentMappingService mappingService;
    private final BrandConfigService brandConfigService;
    private final BrandValidationService brandValidationService;
    private final TelemetryService telemetryService;

    // PERFORMANCE: Reduce default variations to 1 for faster response
    @Value("${aem.agent.suggestions.count:1}")
    private int suggestionsCount;

    /**
     * Health check endpoint.
     */
    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "status", "ok",
            "name", "AEM Content Assistant (Java)",
            "version", "1.0.0"
        );
    }

    /**
     * A2A Agent Card for discovery.
     * This allows A2A clients to discover the agent's capabilities.
     */
    @GetMapping("/.well-known/agent-card.json")
    public Map<String, Object> agentCard() {
        return Map.of(
            "name", "AEM Content Assistant",
            "description", "AI assistant for AEM content authoring (Java implementation)",
            "url", "http://localhost:10003",
            "version", "1.0.0",
            "capabilities", Map.of(
                "a2ui", Map.of("version", "0.8")
            )
        );
    }

    /**
     * Handle A2A task requests and return A2UI messages.
     */
    @PostMapping("/tasks")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        // Extract user text from request
        String userText = extractUserText(request);
        telemetryService.record("content.generate", Map.of(
            "promptLength", userText != null ? userText.length() : 0,
            "variations", suggestionsCount
        ));

        // Generate suggestions (default 1 for fast response, configurable via aem.agent.suggestions.count)
        var suggestionsResult = suggestionService.generateMultipleSuggestions(userText, suggestionsCount);

        TaskResponse response = TaskResponse.builder()
            .id(UUID.randomUUID().toString())
            .status("completed")
            .messages(suggestionsResult.messages())
            .artifacts(suggestionsResult.artifacts())
            .build();

        return ResponseEntity.ok(response);
    }

    /**
     * AI-driven page layout recommendation.
     * This is a key A2UI feature where the agent suggests components
     * based on the user's description rather than requiring manual selection.
     *
     * Example: "landing page for summer sale" -> agent recommends hero, teasers, CTA, etc.
     */
    @PostMapping("/recommend")
    public ResponseEntity<PageRecommendation> recommendLayout(@RequestBody Map<String, String> request) {
        String userInput = request.getOrDefault("input", "");
        if (userInput.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        telemetryService.record("layout.recommend", Map.of(
            "promptLength", userInput.length()
        ));

        PageRecommendation recommendation = recommendationService.recommendLayout(userInput);
        return ResponseEntity.ok(recommendation);
    }

    /**
     * Handle user actions from the UI.
     */
    @PostMapping("/actions/{actionName}")
    public ResponseEntity<Map<String, Object>> handleAction(
            @PathVariable String actionName,
            @RequestBody(required = false) Map<String, Object> context) {

        return switch (actionName) {
            case "apply_suggestion" -> handleApplySuggestion(context);
            case "regenerate" -> ResponseEntity.ok(Map.of(
                "success", true,
                "messages", suggestionService.generateSuggestion("random")
            ));
            default -> ResponseEntity.ok(Map.of(
                "success", false,
                "message", "Unknown action: " + actionName
            ));
        };
    }

    private ResponseEntity<Map<String, Object>> handleApplySuggestion(Map<String, Object> context) {
        if (context == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Missing apply context"
            ));
        }

        String componentPath = (String) context.get("componentPath");
        String componentType = (String) context.get("componentType");
        String brandId = (String) context.get("brandId");

        @SuppressWarnings("unchecked")
        Map<String, Object> suggestionMap = (Map<String, Object>) context.get("suggestion");
        ContentSuggestion suggestion = new ContentSuggestion();
        if (suggestionMap != null) {
            suggestion.setTitle((String) suggestionMap.get("title"));
            suggestion.setSubtitle((String) suggestionMap.get("subtitle"));
            suggestion.setDescription((String) suggestionMap.get("description"));
            suggestion.setCtaText((String) suggestionMap.get("ctaText"));
            suggestion.setCtaUrl((String) suggestionMap.get("ctaUrl"));
            suggestion.setImageUrl((String) suggestionMap.get("imageUrl"));
            suggestion.setComponentType((String) suggestionMap.get("componentType"));
            suggestion.setPrice((String) suggestionMap.get("price"));
        }

        BrandValidationResult validation = brandValidationService.validate(
            suggestion,
            brandId != null
                ? brandConfigService.getBrandConfig(brandId).orElse(brandConfigService.getActiveBrandConfig())
                : brandConfigService.getActiveBrandConfig()
        );

        if (validation.hasErrors()) {
            return ResponseEntity.unprocessableEntity().body(Map.of(
                "success", false,
                "message", "Brand validation failed",
                "validation", validation
            ));
        }

        if (componentPath == null || componentPath.isBlank()) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Validated. No component path provided.",
                "validation", validation
            ));
        }

        Map<String, Object> properties = mappingService.mapSuggestion(suggestion, componentType);
        boolean updated = aemIntegrationService.updateComponentProperties(componentPath, properties);
        telemetryService.record("aem.apply_suggestion", Map.of(
            "componentPath", componentPath,
            "success", updated
        ));

        return ResponseEntity.ok(Map.of(
            "success", updated,
            "message", updated ? "Content applied to component" : "Failed to apply content",
            "properties", properties,
            "validation", validation
        ));
    }

    /**
     * Extracts user text from the task request.
     */
    private String extractUserText(TaskRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().getParts() == null) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        for (TaskRequest.MessagePart part : request.getMessage().getParts()) {
            if (part.getText() != null) {
                sb.append(part.getText());
            }
        }
        return sb.toString();
    }
}
