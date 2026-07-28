package com.example.aema2ui.agent.tool;

import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.model.SeoValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Tool for analyzing SEO quality of generated content.
 * Evaluates title, description, CTA, and image accessibility.
 */
@Slf4j
@Component
public class SeoAnalysisTool {

    /**
     * Analyze the SEO quality of a content suggestion.
     */
    public SeoValidationResult analyze(ContentSuggestion content) {
        log.info("SEO Analysis: title='{}'", content.getTitle());

        int score = 100;
        List<String> issues = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        // Title analysis
        String title = content.getTitle();
        if (title == null || title.isEmpty()) {
            score -= 30;
            issues.add("Missing title");
            recommendations.add("Add a compelling headline");
        } else {
            if (title.length() < 10) {
                score -= 15;
                issues.add("Title too short (< 10 chars)");
                recommendations.add("Expand headline to 30-60 characters for better SEO");
            }
            if (title.length() > 60) {
                score -= 10;
                issues.add("Title too long (> 60 chars)");
                recommendations.add("Shorten headline to under 60 characters");
            }
        }

        // Description analysis
        String desc = content.getDescription();
        if (desc == null || desc.isEmpty()) {
            score -= 25;
            issues.add("Missing description");
            recommendations.add("Add a meta description (120-160 chars)");
        } else {
            if (desc.length() < 50) {
                score -= 15;
                issues.add("Description too short (< 50 chars)");
                recommendations.add("Expand description to 120-160 characters");
            }
            if (desc.length() > 160) {
                score -= 10;
                issues.add("Description too long (> 160 chars)");
                recommendations.add("Shorten description to under 160 characters");
            }
        }

        // CTA analysis
        if (content.getCtaText() == null || content.getCtaText().isEmpty()) {
            score -= 10;
            issues.add("Missing call-to-action");
            recommendations.add("Add a clear CTA button");
        }

        // Image analysis
        if (content.getImageUrl() == null || content.getImageUrl().isEmpty()) {
            score -= 10;
            issues.add("Missing image");
            recommendations.add("Add a relevant hero image");
        }
        if (content.getImageAlt() == null || content.getImageAlt().isEmpty()) {
            score -= 5;
            issues.add("Missing image alt text");
            recommendations.add("Add alt text for accessibility and SEO");
        }

        int finalScore = Math.max(0, Math.min(100, score));
        boolean passed = finalScore >= 60;

        SeoValidationResult result = SeoValidationResult.builder()
            .score(finalScore)
            .issues(issues)
            .recommendations(recommendations)
            .passed(passed)
            .build();

        log.info("SEO Analysis complete: score={}, passed={}, issues={}", finalScore, passed, issues.size());
        return result;
    }
}
