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
public class LiveUser {
    private String sessionId;
    private String username;
    private String avatar;
    private String currentContentId;
    private float cursorX;
    private float cursorY;
    private Instant connectedAt;
    private Instant lastActive;
}
