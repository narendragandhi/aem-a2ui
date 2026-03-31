package com.example.aema2ui.service;

import com.example.aema2ui.model.ContentSuggestion;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Maps ContentSuggestion fields to AEM component properties.
 * Keeps mappings centralized for reuse across "apply" and save flows.
 */
@Service
public class AemComponentMappingService {

    /**
     * Map a content suggestion to AEM component dialog properties.
     * @param suggestion content to map
     * @param componentType target component type override
     * @return map of AEM properties
     */
    public Map<String, Object> mapSuggestion(ContentSuggestion suggestion, String componentType) {
        if (suggestion == null) {
            return Map.of();
        }

        String type = componentType != null && !componentType.isBlank()
            ? componentType.toLowerCase(Locale.ROOT)
            : (suggestion.getComponentType() != null
                ? suggestion.getComponentType().toLowerCase(Locale.ROOT)
                : "teaser");

        Map<String, Object> mapped = new HashMap<>();

        // Common AEM Core Components (Teaser/Hero/Banner) mapping
        mapped.put("jcr:title", suggestion.getTitle());
        mapped.put("jcr:description", suggestion.getDescription());
        if (suggestion.getImageUrl() != null) {
            mapped.put("fileReference", suggestion.getImageUrl());
        }
        if (suggestion.getCtaUrl() != null) {
            mapped.put("linkURL", suggestion.getCtaUrl());
        }

        switch (type) {
            case "hero", "banner", "teaser" -> {
                if (suggestion.getSubtitle() != null) {
                    mapped.put("subtitle", suggestion.getSubtitle());
                }
                if (suggestion.getCtaText() != null) {
                    mapped.put("linkText", suggestion.getCtaText());
                }
            }
            case "product" -> {
                if (suggestion.getSubtitle() != null) {
                    mapped.put("subtitle", suggestion.getSubtitle());
                }
                if (suggestion.getPrice() != null) {
                    mapped.put("price", suggestion.getPrice());
                }
                if (suggestion.getCtaText() != null) {
                    mapped.put("ctaText", suggestion.getCtaText());
                }
            }
            default -> {
                if (suggestion.getSubtitle() != null) {
                    mapped.put("subtitle", suggestion.getSubtitle());
                }
                if (suggestion.getCtaText() != null) {
                    mapped.put("linkText", suggestion.getCtaText());
                }
            }
        }

        // Remove nulls to avoid overwriting existing values
        mapped.entrySet().removeIf(e -> e.getValue() == null);
        return mapped;
    }
}
