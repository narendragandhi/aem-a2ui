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
public class CollaborationEvent {
    private String type;
    private String username;
    private String contentId;
    private String data;
    private Instant timestamp;

    public static CollaborationEvent userJoined(String username, String contentId) {
        return CollaborationEvent.builder()
                .type("USER_JOINED")
                .username(username)
                .contentId(contentId)
                .timestamp(Instant.now())
                .build();
    }

    public static CollaborationEvent userLeft(String username, String contentId) {
        return CollaborationEvent.builder()
                .type("USER_LEFT")
                .username(username)
                .contentId(contentId)
                .timestamp(Instant.now())
                .build();
    }

    public static CollaborationEvent contentChanged(String contentId, String contentJson, String changedBy) {
        return CollaborationEvent.builder()
                .type("CONTENT_CHANGED")
                .contentId(contentId)
                .username(changedBy)
                .data(contentJson)
                .timestamp(Instant.now())
                .build();
    }
}
