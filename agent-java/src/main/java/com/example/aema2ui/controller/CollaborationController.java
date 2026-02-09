package com.example.aema2ui.controller;

import com.example.aema2ui.service.CollaborationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @MessageMapping("/chat/{contentId}")
    public void handleChat(@DestinationVariable String contentId,
                           @Payload Map<String, Object> message,
                           SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String msg = (String) message.getOrDefault("message", "");
        collaborationService.sendChatMessage(sessionId, contentId, msg);
    }

    @MessageMapping("/cursor/{contentId}")
    public void handleCursor(@DestinationVariable String contentId,
                           @Payload Map<String, Object> cursorData,
                           SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        float x = ((Number) cursorData.getOrDefault("x", 0)).floatValue();
        float y = ((Number) cursorData.getOrDefault("y", 0)).floatValue();
        collaborationService.updateUserCursor(sessionId, contentId, x, y);
    }

    @MessageMapping("/join/{contentId}")
    public void handleJoin(@DestinationVariable String contentId,
                           @Payload Map<String, Object> userData,
                           SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String username = (String) userData.getOrDefault("username", "Anonymous");
        String avatar = (String) userData.getOrDefault("avatar", "");

        collaborationService.userConnected(sessionId, username, avatar);
        collaborationService.joinContentRoom(sessionId, contentId);
    }

    @MessageMapping("/selection/{contentId}")
    public void handleSelection(@DestinationVariable String contentId,
                               @Payload Map<String, Object> selectionData,
                               SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String field = (String) selectionData.getOrDefault("field", "");
        int startIndex = ((Number) selectionData.getOrDefault("startIndex", 0)).intValue();
        int endIndex = ((Number) selectionData.getOrDefault("endIndex", 0)).intValue();
        String selectedText = (String) selectionData.getOrDefault("selectedText", "");

        if (selectedText.isEmpty()) {
            collaborationService.clearSelection(sessionId, contentId, field);
        } else {
            collaborationService.updateSelection(sessionId, contentId, field, startIndex, endIndex, selectedText);
        }
    }

    @MessageMapping("/reaction/{contentId}")
    public void handleReaction(@DestinationVariable String contentId,
                              @Payload Map<String, Object> reactionData,
                              SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String emoji = (String) reactionData.getOrDefault("emoji", "");
        String action = (String) reactionData.getOrDefault("action", "add");
        String field = (String) reactionData.getOrDefault("field", "");

        if ("remove".equals(action)) {
            collaborationService.removeReaction(sessionId, contentId, emoji);
        } else {
            collaborationService.addReaction(sessionId, contentId, emoji, field);
        }
    }

    @MessageMapping("/lock/{contentId}")
    public void handleLock(@DestinationVariable String contentId,
                          @Payload Map<String, Object> lockData,
                          SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String action = (String) lockData.getOrDefault("action", "lock");
        String field = (String) lockData.getOrDefault("field", "");

        if ("unlock".equals(action)) {
            collaborationService.unlockField(sessionId, contentId, field);
        } else {
            boolean locked = collaborationService.lockField(sessionId, contentId, field);
            if (!locked) {
                log.debug("Field {} already locked by another user", field);
            }
        }
    }

    @MessageMapping("/edit/{contentId}")
    public void handleEdit(@DestinationVariable String contentId,
                          @Payload Map<String, Object> editData,
                          SimpMessageHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        if (sessionId == null) return;

        String field = (String) editData.getOrDefault("field", "");
        String oldValue = (String) editData.getOrDefault("oldValue", "");
        String newValue = (String) editData.getOrDefault("newValue", "");

        collaborationService.broadcastContentEdit(sessionId, contentId, field, oldValue, newValue);
    }
}
