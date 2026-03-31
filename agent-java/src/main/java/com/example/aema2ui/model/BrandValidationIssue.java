package com.example.aema2ui.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandValidationIssue {
    public enum Severity {
        INFO,
        WARNING,
        ERROR
    }

    private String code;
    private String message;
    private String field;
    private Severity severity;
}
