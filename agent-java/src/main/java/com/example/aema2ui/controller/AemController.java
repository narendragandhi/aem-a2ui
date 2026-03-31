package com.example.aema2ui.controller;

import com.example.aema2ui.config.AemConfig;
import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.model.BrandValidationResult;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.service.AemComponentMappingService;
import com.example.aema2ui.service.AemIntegrationService;
import com.example.aema2ui.service.BrandConfigService;
import com.example.aema2ui.service.BrandValidationService;
import com.example.aema2ui.service.TelemetryService;
import com.example.aema2ui.service.aem.AemContentClient;
import com.example.aema2ui.service.aem.AemContentFragmentClient;
import com.example.aema2ui.service.aem.AemHttpClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for AEM integration endpoints.
 * Provides health check and content operations.
 */
@Slf4j
@RestController
@RequestMapping("/aem")
@RequiredArgsConstructor
public class AemController {

    private final AemHttpClient aemHttpClient;
    private final AemConfig aemConfig;
    private final AemContentClient aemContentClient;
    private final AemContentFragmentClient contentFragmentClient;
    private final AemIntegrationService aemIntegrationService;
    private final AemComponentMappingService mappingService;
    private final BrandConfigService brandConfigService;
    private final BrandValidationService brandValidationService;
    private final TelemetryService telemetryService;

    /**
     * Check AEM connection health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("enabled", aemConfig.isEnabled());
        status.put("authorUrl", aemConfig.getAuthorUrl());

        boolean connected = aemHttpClient.checkConnection();
        status.put("connected", connected);
        status.put("status", connected ? "CONNECTED" : "DISCONNECTED");

        if (!aemConfig.isEnabled()) {
            status.put("message", "AEM integration is disabled. Using mock mode.");
        } else if (!connected) {
            status.put("message", "Cannot connect to AEM at " + aemConfig.getAuthorUrl());
        } else {
            status.put("message", "Connected to AEM successfully");
        }

        return ResponseEntity.ok(status);
    }

    /**
     * Save content to AEM as a page or content fragment
     */
    @PostMapping("/content")
    public ResponseEntity<Map<String, Object>> saveContent(@RequestBody Map<String, Object> request) {
        if (!aemHttpClient.isConnected()) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "AEM not connected",
                "message", "Cannot save content while AEM is disconnected"
            ));
        }

        try {
            String contentType = (String) request.getOrDefault("type", "page");
            String name = (String) request.get("name");
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) request.get("properties");
            ContentSuggestion content = extractContentSuggestion(request.get("content"));
            BrandValidationResult validation = validateBrand(content, (String) request.get("brandId"));
            if (validation != null && validation.hasErrors()) {
                return ResponseEntity.unprocessableEntity().body(Map.of(
                    "error", "Brand validation failed",
                    "validation", validation
                ));
            }

            String path;
            if ("fragment".equals(contentType)) {
                String folder = (String) request.getOrDefault("folder", aemConfig.getDamRoot() + "/generated");
                String model = (String) request.getOrDefault("model", "/conf/aem-demo/settings/dam/cfm/models/generated-content");
                path = aemContentClient.createContentFragment(folder, name, model, properties);
            } else {
                String parentPath = (String) request.getOrDefault("parentPath", aemConfig.getContentRoot());
                String template = (String) request.getOrDefault("template", "/conf/aem-demo/settings/wcm/templates/content-page");
                path = aemContentClient.createPage(parentPath, name, template, properties);
            }

            telemetryService.record("aem.save_content", Map.of(
                "type", contentType,
                "path", path
            ));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "path", path,
                "aemUrl", aemConfig.getAuthorUrl() + "/editor.html" + path + ".html",
                "validation", validation
            ));
        } catch (Exception e) {
            log.error("Failed to save content to AEM", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Save failed",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Update existing content in AEM.
     * Supports pages and content fragments.
     */
    @PostMapping("/content/update")
    public ResponseEntity<Map<String, Object>> updateContent(@RequestBody Map<String, Object> request) {
        if (!aemHttpClient.isConnected()) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "AEM not connected",
                "message", "Cannot update content while AEM is disconnected"
            ));
        }

        try {
            String contentType = (String) request.getOrDefault("type", "page");
            String path = (String) request.get("path");
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) request.get("properties");
            ContentSuggestion content = extractContentSuggestion(request.get("content"));
            BrandValidationResult validation = validateBrand(content, (String) request.get("brandId"));
            if (validation != null && validation.hasErrors()) {
                return ResponseEntity.unprocessableEntity().body(Map.of(
                    "error", "Brand validation failed",
                    "validation", validation
                ));
            }

            if ("fragment".equals(contentType)) {
                contentFragmentClient.updateContentFragment(path, properties != null ? properties : Map.of());
            } else {
                aemContentClient.updateContent(path, properties != null ? properties : Map.of());
            }

            telemetryService.record("aem.update_content", Map.of(
                "type", contentType,
                "path", path
            ));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "path", path,
                "validation", validation
            ));
        } catch (Exception e) {
            log.error("Failed to update content in AEM", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Update failed",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Apply a content suggestion to an existing component path.
     */
    @PostMapping("/components/apply")
    public ResponseEntity<Map<String, Object>> applySuggestion(@RequestBody ApplySuggestionRequest request) {
        if (!aemHttpClient.isConnected()) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "AEM not connected",
                "message", "Cannot apply content while AEM is disconnected"
            ));
        }
        if (request.componentPath == null || request.componentPath.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing componentPath"
            ));
        }
        if (request.suggestion == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Missing content suggestion"
            ));
        }

        BrandValidationResult validation = validateBrand(request.suggestion, request.brandId);
        if (validation != null && validation.hasErrors()) {
            return ResponseEntity.unprocessableEntity().body(Map.of(
                "error", "Brand validation failed",
                "validation", validation
            ));
        }

        Map<String, Object> properties = mappingService.mapSuggestion(request.suggestion, request.componentType);
        boolean updated = aemIntegrationService.updateComponentProperties(request.componentPath, properties);

        telemetryService.record("aem.apply_component", Map.of(
            "componentPath", request.componentPath,
            "success", updated
        ));

        return ResponseEntity.ok(Map.of(
            "success", updated,
            "componentPath", request.componentPath,
            "properties", properties,
            "validation", validation
        ));
    }

    /**
     * Get content from AEM
     */
    @GetMapping("/content/**")
    public ResponseEntity<Map<String, Object>> getContent(@RequestParam String path) {
        if (!aemHttpClient.isConnected()) {
            return ResponseEntity.status(503).body(Map.of(
                "error", "AEM not connected"
            ));
        }

        try {
            Map<String, Object> content = aemContentClient.getContent(path);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            log.error("Failed to get content from AEM: {}", path, e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to get content",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get AEM configuration (non-sensitive)
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(Map.of(
            "enabled", aemConfig.isEnabled(),
            "authorUrl", aemConfig.getAuthorUrl(),
            "contentRoot", aemConfig.getContentRoot(),
            "damRoot", aemConfig.getDamRoot(),
            "connected", aemHttpClient.isConnected()
        ));
    }

    private ContentSuggestion extractContentSuggestion(Object value) {
        if (value instanceof ContentSuggestion suggestion) {
            return suggestion;
        }
        if (value instanceof Map<?, ?> map) {
            try {
                // Best-effort: build minimal ContentSuggestion from map
                ContentSuggestion suggestion = new ContentSuggestion();
                suggestion.setTitle((String) map.get("title"));
                suggestion.setSubtitle((String) map.get("subtitle"));
                suggestion.setDescription((String) map.get("description"));
                suggestion.setCtaText((String) map.get("ctaText"));
                suggestion.setCtaUrl((String) map.get("ctaUrl"));
                suggestion.setImageUrl((String) map.get("imageUrl"));
                suggestion.setComponentType((String) map.get("componentType"));
                suggestion.setPrice((String) map.get("price"));
                return suggestion;
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    private BrandValidationResult validateBrand(ContentSuggestion content, String brandId) {
        if (content == null) {
            return null;
        }
        BrandConfig brandConfig = brandId != null
            ? brandConfigService.getBrandConfig(brandId).orElse(brandConfigService.getActiveBrandConfig())
            : brandConfigService.getActiveBrandConfig();
        return brandValidationService.validate(content, brandConfig);
    }

    @lombok.Data
    public static class ApplySuggestionRequest {
        private String componentPath;
        private String componentType;
        private String brandId;
        private ContentSuggestion suggestion;
    }
}
