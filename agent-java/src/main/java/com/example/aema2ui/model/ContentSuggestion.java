package com.example.aema2ui.model;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Domain model for AI-generated content suggestions.
 * Used by Embabel for type-safe LLM interactions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentSuggestion {

    @JsonPropertyDescription("Unique identifier for this suggestion")
    private String id;

    @JsonPropertyDescription("The type of AEM component (hero, product, teaser, banner)")
    private String componentType;

    @JsonPropertyDescription("Main headline or title for the component")
    private String title;

    @JsonPropertyDescription("Subtitle or secondary headline")
    private String subtitle;

    @JsonPropertyDescription("Main body text or description")
    private String description;

    @JsonPropertyDescription("Call-to-action button text")
    private String ctaText;

    @JsonPropertyDescription("URL for the call-to-action button")
    private String ctaUrl;

    @JsonPropertyDescription("URL for the hero/banner image")
    private String imageUrl;

    @JsonPropertyDescription("Alt text for accessibility")
    private String imageAlt;

    @JsonPropertyDescription("Price if this is a product component")
    private String price;

    @JsonPropertyDescription("Additional CSS class for styling")
    private String styleClass;

    @JsonPropertyDescription("SEO metadata as a JSON object")
    private String seo;

    @JsonPropertyDescription("SEO score (0-100)")
    private Integer seoScore;

    @JsonPropertyDescription("Visual quality score (0-100)")
    private Integer visualScore;
}
