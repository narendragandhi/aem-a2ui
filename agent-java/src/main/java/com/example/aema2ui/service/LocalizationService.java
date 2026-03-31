package com.example.aema2ui.service;

import com.example.aema2ui.model.ContentSuggestion;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LocalizationService {

    private final LlmService llmService;

    /**
     * Localize content into a list of target languages.
     * @param content base content suggestion
     * @param languages list of language codes (e.g., en-US, fr-FR)
     * @return map of language to localized content
     */
    public Map<String, ContentSuggestion> localize(ContentSuggestion content, List<String> languages) {
        Map<String, ContentSuggestion> localized = new HashMap<>();
        if (content == null || languages == null) {
            return localized;
        }
        for (String lang : languages) {
            if (lang == null || lang.isBlank()) {
                continue;
            }
            localized.put(lang, translateContent(content, lang));
        }
        return localized;
    }

    private ContentSuggestion translateContent(ContentSuggestion content, String language) {
        if (!llmService.isEnabled()) {
            return stubTranslate(content, language);
        }

        String prompt = """
            Translate the following content fields into %s.
            Preserve meaning and keep it concise.
            Return JSON with keys: title, subtitle, description, ctaText.
            Content:
            title: %s
            subtitle: %s
            description: %s
            ctaText: %s
            """.formatted(
                language,
                safe(content.getTitle()),
                safe(content.getSubtitle()),
                safe(content.getDescription()),
                safe(content.getCtaText())
            );

        try {
            String response = llmService.generate(prompt);
            // Best-effort: reuse original and append response if JSON parse fails.
            ContentSuggestion translated = copyBase(content);
            Map<String, String> fields = JsonHelper.tryParseMap(response);
            if (fields != null) {
                translated.setTitle(fields.getOrDefault("title", content.getTitle()));
                translated.setSubtitle(fields.getOrDefault("subtitle", content.getSubtitle()));
                translated.setDescription(fields.getOrDefault("description", content.getDescription()));
                translated.setCtaText(fields.getOrDefault("ctaText", content.getCtaText()));
            } else {
                translated.setTitle(content.getTitle());
                translated.setSubtitle(content.getSubtitle());
                translated.setDescription(content.getDescription());
                translated.setCtaText(content.getCtaText());
            }
            return translated;
        } catch (Exception e) {
            return stubTranslate(content, language);
        }
    }

    private ContentSuggestion stubTranslate(ContentSuggestion content, String language) {
        ContentSuggestion translated = copyBase(content);
        translated.setTitle(tag(content.getTitle(), language));
        translated.setSubtitle(tag(content.getSubtitle(), language));
        translated.setDescription(tag(content.getDescription(), language));
        translated.setCtaText(tag(content.getCtaText(), language));
        return translated;
    }

    private ContentSuggestion copyBase(ContentSuggestion content) {
        ContentSuggestion copy = new ContentSuggestion();
        copy.setId(content.getId());
        copy.setComponentType(content.getComponentType());
        copy.setImageUrl(content.getImageUrl());
        copy.setImageAlt(content.getImageAlt());
        copy.setCtaUrl(content.getCtaUrl());
        copy.setPrice(content.getPrice());
        copy.setSeo(content.getSeo());
        copy.setSeoScore(content.getSeoScore());
        copy.setVisualScore(content.getVisualScore());
        return copy;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String tag(String value, String language) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return "[" + language + "] " + value;
    }

    /**
     * Minimal JSON helper to parse flat string map responses.
     */
    static class JsonHelper {
        @SuppressWarnings("unchecked")
        /**
         * Attempt to parse a flat JSON map from a string.
         */
        static Map<String, String> tryParseMap(String json) {
            try {
                return new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
            } catch (Exception ignored) {
                return null;
            }
        }
    }
}
