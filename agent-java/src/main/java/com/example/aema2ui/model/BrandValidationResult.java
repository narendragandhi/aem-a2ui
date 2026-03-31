package com.example.aema2ui.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BrandValidationResult {
    private int score;
    private List<BrandValidationIssue> issues;

    public boolean hasErrors() {
        if (issues == null) {
            return false;
        }
        return issues.stream().anyMatch(i -> i.getSeverity() == BrandValidationIssue.Severity.ERROR);
    }
}
