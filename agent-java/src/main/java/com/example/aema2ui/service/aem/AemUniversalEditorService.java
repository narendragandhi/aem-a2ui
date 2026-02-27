package com.example.aema2ui.service.aem;

import com.example.aema2ui.config.AemConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for AEM Universal Editor integration.
 * Provides utilities for instrumenting components with UE attributes.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AemUniversalEditorService {

    private final AemConfig config;

    /**
     * Get configuration for Universal Editor embedding
     */
    public Map<String, Object> getUniversalEditorConfig() {
        Map<String, Object> config = new HashMap<>();
        
        config.put("enabled", this.config.isEnabled());
        config.put("aemAuthorUrl", this.config.getAuthorUrl());
        config.put("imsToken", "%%TOKEN%%"); // Replaced by frontend
        config.put("siteId", UUID.randomUUID().toString());
        
        return config;
    }

    /**
     * Generate data-aue- attribute map for a component
     */
    public Map<String, String> getEditableAttributes(String itemScope, String resourcePath, Map<String, Object> model) {
        Map<String, String> attrs = new LinkedHashMap<>();
        
        // Required UE attributes
        attrs.put("data-aue-prop", "itemScope");
        attrs.put("data-aue-itemscope", itemScope);
        attrs.put("data-aue-resource", resourcePath);
        
        // Add model as JSON
        if (model != null) {
            attrs.put("data-aue-model", ""); // Empty triggers auto-detection
        }
        
        return attrs;
    }

    /**
     * Generate field-specific editing attributes
     */
    public Map<String, String> getFieldAttributes(String resourcePath, String fieldName, String fieldType) {
        Map<String, String> attrs = new LinkedHashMap<>();
        
        attrs.put("data-aue-prop", fieldName);
        attrs.put("data-aue-resource", resourcePath + "/" + fieldName);
        attrs.put("data-aue-type", fieldType != null ? fieldType : "text");
        
        return attrs;
    }

    /**
     * Component definitions for UE Properties Panel
     */
    public List<Map<String, Object>> getComponentDefinitions() {
        return List.of(
            createComponentDef("hero", "Hero Banner", "marketing",
                Map.of("title", Map.of("type", "text", "label", "Title"),
                       "subtitle", Map.of("type", "text", "label", "Subtitle"),
                       "description", Map.of("type", "richtext", "label", "Description"),
                       "ctaText", Map.of("type", "text", "label", "CTA Text"),
                       "ctaUrl", Map.of("type", "text", "label", "CTA URL"),
                       "imageUrl", Map.of("type", "image", "label", "Background Image"))),
            
            createComponentDef("teaser", "Teaser", "marketing",
                Map.of("title", Map.of("type", "text", "label", "Title"),
                       "description", Map.of("type", "richtext", "label", "Description"),
                       "ctaText", Map.of("type", "text", "label", "CTA Text"),
                       "ctaUrl", Map.of("type", "text", "label", "CTA URL"),
                       "imageUrl", Map.of("type", "image", "label", "Image"))),
            
            createComponentDef("product-card", "Product Card", "commerce",
                Map.of("title", Map.of("type", "text", "label", "Product Name"),
                       "price", Map.of("type", "text", "label", "Price"),
                       "description", Map.of("type", "richtext", "label", "Description"),
                       "imageUrl", Map.of("type", "image", "label", "Product Image"))),
            
            createComponentDef("text", "Text", "content",
                Map.of("text", Map.of("type", "richtext", "label", "Text Content"))),
            
            createComponentDef("image", "Image", "media",
                Map.of("src", Map.of("type", "image", "label", "Image"),
                       "alt", Map.of("type", "text", "label", "Alt Text"))),
            
            createComponentDef("button", "Button", "interactive",
                Map.of("text", Map.of("type", "text", "label", "Button Text"),
                       "url", Map.of("type", "text", "label", "Link URL"),
                       "variant", Map.of("type", "select", "label", "Variant",
                                         "options", List.of("primary", "secondary", "ghost")))),
            
            createComponentDef("navigation", "Navigation", "navigation",
                Map.of("title", Map.of("type", "text", "label", "Title"),
                       "items", Map.of("type", "array", "label", "Navigation Items",
                                      "items", Map.of("type", "object",
                                                     "properties", Map.of(
                                                         "label", Map.of("type", "text"),
                                                         "url", Map.of("type", "text")))))),
            
            createComponentDef("footer", "Footer", "navigation",
                Map.of("title", Map.of("type", "text", "label", "Company Name"),
                       "description", Map.of("type", "richtext", "label", "Description"),
                       "items", Map.of("type", "array", "label", "Links")))
        );
    }

    private Map<String, Object> createComponentDef(String id, String title, String group, Map<String, Object> fields) {
        Map<String, Object> def = new HashMap<>();
        def.put("id", id);
        def.put("title", title);
        def.put("group", group);
        def.put("fields", fields);
        
        return def;
    }

    /**
     * Get list of supported component types
     */
    public List<String> getSupportedComponentTypes() {
        return List.of(
            "hero", "teaser", "product-card", "banner", "carousel",
            "text", "image", "video", "button", "cta",
            "accordion", "tabs", "quote", "form",
            "navigation", "footer", "breadcrumb",
            "card", "grid", "list"
        );
    }

    /**
     * Check if a component type is supported
     */
    public boolean isComponentSupported(String componentType) {
        return getSupportedComponentTypes().contains(componentType.toLowerCase());
    }

    /**
     * Get field schema for a component type (for Properties Panel)
     */
    public Map<String, Object> getFieldSchema(String componentType) {
        List<Map<String, Object>> definitions = getComponentDefinitions();
        
        for (Map<String, Object> def : definitions) {
            if (def.get("id").equals(componentType)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> fields = (Map<String, Object>) def.get("fields");
                return fields;
            }
        }
        
        return Collections.emptyMap();
    }
}
