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
public class Notification {
    private String id;
    private String userId;
    private String type;
    private String title;
    private String message;
    private String contentId;
    private String fromUser;
    private boolean read;
    private Instant createdAt;
}

