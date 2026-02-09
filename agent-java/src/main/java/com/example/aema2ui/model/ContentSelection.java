package com.example.aema2ui.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContentSelection {
    private String id;
    private String sessionId;
    private String username;
    private String contentId;
    private String field;
    private int startIndex;
    private int endIndex;
    private String selectedText;
    private Instant timestamp;
}
