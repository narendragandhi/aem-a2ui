package com.example.aema2ui.service;

import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.model.BrandValidationIssue;
import com.example.aema2ui.model.BrandValidationResult;
import com.example.aema2ui.model.ContentSuggestion;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class BrandValidationService {

    /**
     * Validate content against brand rules and return a scored result.
     * @param content content suggestion to validate
     * @param brandConfig active brand configuration
     * @return validation result with score and issues
     */
    public BrandValidationResult validate(ContentSuggestion content, BrandConfig brandConfig) {
        List<BrandValidationIssue> issues = new ArrayList<>();

        if (content == null || brandConfig == null) {
            return BrandValidationResult.builder()
                .score(0)
                .issues(List.of(BrandValidationIssue.builder()
                    .code("brand.config.missing")
                    .message("Brand config or content missing")
                    .severity(BrandValidationIssue.Severity.WARNING)
                    .build()))
                .build();
        }

        String combined = combineText(content).toLowerCase(Locale.ROOT);

        // Avoided words -> errors
        if (brandConfig.getVoice() != null && brandConfig.getVoice().getAvoid() != null) {
            for (String avoid : brandConfig.getVoice().getAvoid()) {
                if (avoid != null && !avoid.isBlank() && combined.contains(avoid.toLowerCase(Locale.ROOT))) {
                    issues.add(BrandValidationIssue.builder()
                        .code("voice.avoid")
                        .message("Avoided term detected: " + avoid)
                        .field("content")
                        .severity(BrandValidationIssue.Severity.ERROR)
                        .build());
                }
            }
        }

        // Value pillars -> warning if none present
        if (brandConfig.getMessaging() != null && brandConfig.getMessaging().getValuePillars() != null) {
            boolean pillarFound = brandConfig.getMessaging().getValuePillars().stream()
                .filter(p -> p != null && !p.isBlank())
                .anyMatch(p -> combined.contains(p.toLowerCase(Locale.ROOT)));
            if (!pillarFound && !brandConfig.getMessaging().getValuePillars().isEmpty()) {
                issues.add(BrandValidationIssue.builder()
                    .code("messaging.pillar.missing")
                    .message("No brand value pillars referenced")
                    .field("content")
                    .severity(BrandValidationIssue.Severity.WARNING)
                    .build());
            }
        }

        // CTA phrases -> warning if CTA present but not in brand examples
        if (content.getCtaText() != null && brandConfig.getExamples() != null
            && brandConfig.getExamples().getCtaPhrases() != null
            && !brandConfig.getExamples().getCtaPhrases().isEmpty()) {
            boolean ctaMatch = brandConfig.getExamples().getCtaPhrases().stream()
                .filter(p -> p != null && !p.isBlank())
                .anyMatch(p -> content.getCtaText().equalsIgnoreCase(p));
            if (!ctaMatch) {
                issues.add(BrandValidationIssue.builder()
                    .code("cta.not.recommended")
                    .message("CTA does not match recommended brand phrases")
                    .field("ctaText")
                    .severity(BrandValidationIssue.Severity.WARNING)
                    .build());
            }
        }

        int score = scoreFromIssues(issues);
        return BrandValidationResult.builder()
            .score(score)
            .issues(issues)
            .build();
    }

    private int scoreFromIssues(List<BrandValidationIssue> issues) {
        int score = 100;
        for (BrandValidationIssue issue : issues) {
            if (issue.getSeverity() == BrandValidationIssue.Severity.ERROR) {
                score -= 30;
            } else if (issue.getSeverity() == BrandValidationIssue.Severity.WARNING) {
                score -= 10;
            }
        }
        return Math.max(0, score);
    }

    private String combineText(ContentSuggestion content) {
        StringBuilder sb = new StringBuilder();
        if (content.getTitle() != null) sb.append(content.getTitle()).append(' ');
        if (content.getSubtitle() != null) sb.append(content.getSubtitle()).append(' ');
        if (content.getDescription() != null) sb.append(content.getDescription()).append(' ');
        if (content.getCtaText() != null) sb.append(content.getCtaText()).append(' ');
        return sb.toString().trim();
    }
}
