package com.example.aema2ui.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * SEO validation result for generated content.
 * Contains score, issues, and recommendations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeoValidationResult {

    private int score;
    private List<String> issues;
    private List<String> recommendations;
    private boolean passed;

    public static SeoValidationResult passing(int score) {
        return SeoValidationResult.builder()
            .score(score)
            .issues(List.of())
            .recommendations(List.of())
            .passed(true)
            .build();
    }
}
