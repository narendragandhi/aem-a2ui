package com.example.aema2ui.controller;

import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.model.ContentSuggestion;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoints for the App Builder Universal Editor extension.
 * Serves the extension panel and handles IMS-authenticated requests.
 */
@Slf4j
@RestController
public class ExtensionController {

    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Value("classpath:/extension/index.html")
    private Resource extensionHtml;

    public ExtensionController(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }

    @GetMapping(value = "/extension-panel", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> extensionPanel() {
        try {
            String html = new String(extensionHtml.getInputStream().readAllBytes());
            return ResponseEntity.ok(html);
        } catch (Exception e) {
            log.warn("Extension panel not available, serving inline: {}", e.getMessage());
            return ResponseEntity.ok("""
                <!DOCTYPE html><html><body>
                <h2>AI Content Assistant</h2>
                <p>Extension loaded. Connect to your AEM instance to use.</p>
                </body></html>
                """);
        }
    }

    @PostMapping("/extension/config")
    public ResponseEntity<Map<String, Object>> getConfig(@RequestBody Map<String, String> request) {
        String componentType = request.getOrDefault("componentType", "hero");
        String brandId = request.getOrDefault("brandId", "default");

        return ResponseEntity.ok(Map.of(
            "componentType", componentType,
            "brandConfigPath", "/content/dam/aem-a2ui/brand-config.json",
            "availableTypes", new String[]{"hero", "product", "teaser", "banner", "cta", "quote"},
            "uiConfig", Map.of(
                "showBrandPanel", true,
                "showPreview", true,
                "showScoring", true
            )
        ));
    }
}
