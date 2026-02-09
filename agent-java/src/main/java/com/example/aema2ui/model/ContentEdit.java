package com.example.aema2ui.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentEdit {
    private String id;
    private String sessionId;
    private String username;
    private String contentId;
    private String field;
    private String oldValue;
    private String newValue;
    private Instant timestamp;
    private Map<String, Object> metadata;
}
