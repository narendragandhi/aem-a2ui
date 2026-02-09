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
public class ContentReaction {
    private String id;
    private String sessionId;
    private String username;
    private String contentId;
    private String emoji;
    private String field;
    private Instant timestamp;
}
