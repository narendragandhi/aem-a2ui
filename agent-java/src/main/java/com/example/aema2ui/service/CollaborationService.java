package com.example.aema2ui.service;

import com.example.aema2ui.model.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private final Map<String, LiveUser> connectedUsers = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> contentRooms = new ConcurrentHashMap<>();
    private final Map<String, List<ChatMessage>> chatHistory = new ConcurrentHashMap<>();
    private final Map<String, ContentSelection> activeSelections = new ConcurrentHashMap<>();
    private final Map<String, Set<ContentReaction>> contentReactions = new ConcurrentHashMap<>();
    private final Map<String, List<ContentEdit>> editHistory = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> lockedFields = new ConcurrentHashMap<>();

    public void userConnected(String sessionId, String username, String avatar) {
        LiveUser user = LiveUser.builder()
                .sessionId(sessionId)
                .username(username)
                .avatar(avatar)
                .connectedAt(Instant.now())
                .lastActive(Instant.now())
                .build();

        connectedUsers.put(sessionId, user);
        log.info("User connected: {} ({})", username, sessionId);

        broadcastPresence();
    }

    public void userDisconnected(String sessionId) {
        LiveUser user = connectedUsers.remove(sessionId);
        if (user != null) {
            clearUserSelections(sessionId);
            releaseAllLocks(sessionId);
            log.info("User disconnected: {}", user.getUsername());
            broadcastPresence();
        }
    }

    public void updateUserCursor(String sessionId, String contentId, float x, float y) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user != null) {
            user.setCurrentContentId(contentId);
            user.setCursorX(x);
            user.setCursorY(y);
            user.setLastActive(Instant.now());

            messagingTemplate.convertAndSend("/topic/cursor/" + contentId,
                    Map.of("sessionId", sessionId, "username", user.getUsername(),
                            "avatar", user.getAvatar(), "x", x, "y", y));
        }
    }

    public void joinContentRoom(String sessionId, String contentId) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user != null) {
            user.setCurrentContentId(contentId);

            contentRooms.computeIfAbsent(contentId, k -> ConcurrentHashMap.newKeySet())
                    .add(sessionId);

            messagingTemplate.convertAndSend("/topic/room/" + contentId,
                    CollaborationEvent.userJoined(user.getUsername(), contentId));

            List<ChatMessage> history = chatHistory.getOrDefault(contentId, new ArrayList<>());
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/history", history);

            List<ContentEdit> edits = editHistory.getOrDefault(contentId, new ArrayList<>());
            messagingTemplate.convertAndSendToUser(sessionId, "/queue/edits", edits);

            messagingTemplate.convertAndSendToUser(sessionId, "/queue/reactions",
                    contentReactions.getOrDefault(contentId, new HashSet<>()));
        }
    }

    public void sendChatMessage(String sessionId, String contentId, String message) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user == null) return;

        ChatMessage chatMessage = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .content(message)
                .contentId(contentId)
                .timestamp(Instant.now())
                .build();

        chatHistory.computeIfAbsent(contentId, k -> new ArrayList<>()).add(chatMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + contentId, chatMessage);
    }

    public void broadcastContentChange(String contentId, String contentJson, String changedBy, String field) {
        messagingTemplate.convertAndSend("/topic/content/" + contentId,
                Map.of("type", "contentChange", "content", contentJson,
                        "changedBy", changedBy, "field", field, "timestamp", Instant.now()));
    }

    public void broadcastContentEdit(String sessionId, String contentId, String field,
                                     String oldValue, String newValue) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user == null) return;

        ContentEdit edit = ContentEdit.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .username(user.getUsername())
                .contentId(contentId)
                .field(field)
                .oldValue(oldValue)
                .newValue(newValue)
                .timestamp(Instant.now())
                .build();

        editHistory.computeIfAbsent(contentId, k -> new ArrayList<>()).add(edit);

        messagingTemplate.convertAndSend("/topic/edit/" + contentId, edit);
    }

    public void updateSelection(String sessionId, String contentId, String field,
                                int startIndex, int endIndex, String selectedText) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user == null) return;

        String selectionKey = contentId + ":" + field;
        ContentSelection selection = ContentSelection.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .username(user.getUsername())
                .contentId(contentId)
                .field(field)
                .startIndex(startIndex)
                .endIndex(endIndex)
                .selectedText(selectedText)
                .timestamp(Instant.now())
                .build();

        activeSelections.put(selectionKey, selection);

        messagingTemplate.convertAndSend("/topic/selection/" + contentId, selection);
    }

    public void clearSelection(String sessionId, String contentId, String field) {
        String selectionKey = contentId + ":" + field;
        ContentSelection removed = activeSelections.remove(selectionKey);

        messagingTemplate.convertAndSend("/topic/selection/" + contentId,
                Map.of("type", "clear", "sessionId", sessionId, "field", field));
    }

    public void addReaction(String sessionId, String contentId, String emoji, String field) {
        LiveUser user = connectedUsers.get(sessionId);
        if (user == null) return;

        ContentReaction reaction = ContentReaction.builder()
                .id(UUID.randomUUID().toString())
                .sessionId(sessionId)
                .username(user.getUsername())
                .contentId(contentId)
                .emoji(emoji)
                .field(field)
                .timestamp(Instant.now())
                .build();

        contentReactions.computeIfAbsent(contentId, k -> ConcurrentHashMap.newKeySet()).add(reaction);

        messagingTemplate.convertAndSend("/topic/reaction/" + contentId, reaction);
    }

    public void removeReaction(String sessionId, String contentId, String emoji) {
        Set<ContentReaction> reactions = contentReactions.get(contentId);
        if (reactions != null) {
            reactions.removeIf(r -> r.getSessionId().equals(sessionId) && r.getEmoji().equals(emoji));
            messagingTemplate.convertAndSend("/topic/reaction/" + contentId,
                    Map.of("type", "remove", "sessionId", sessionId, "emoji", emoji));
        }
    }

    public boolean lockField(String sessionId, String contentId, String field) {
        String lockKey = contentId + ":" + field;
        Set<String> locks = lockedFields.computeIfAbsent(contentId, k -> ConcurrentHashMap.newKeySet());

        if (locks.contains(lockKey)) {
            return false;
        }

        locks.add(lockKey);
        messagingTemplate.convertAndSend("/topic/lock/" + contentId,
                Map.of("type", "locked", "sessionId", sessionId, "field", field));
        return true;
    }

    public void unlockField(String sessionId, String contentId, String field) {
        String lockKey = contentId + ":" + field;
        Set<String> locks = lockedFields.get(contentId);
        if (locks != null) {
            locks.remove(lockKey);
            messagingTemplate.convertAndSend("/topic/lock/" + contentId,
                    Map.of("type", "unlocked", "sessionId", sessionId, "field", field));
        }
    }

    public void releaseAllLocks(String sessionId) {
        lockedFields.forEach((contentId, locks) -> {
            Set<String> toRemove = locks.stream()
                    .filter(lock -> lock.startsWith(sessionId + ":"))
                    .collect(Collectors.toSet());
            toRemove.forEach(lock -> {
                String field = lock.substring(lock.indexOf(":") + 1);
                locks.remove(lock);
                messagingTemplate.convertAndSend("/topic/lock/" + contentId,
                        Map.of("type", "released", "sessionId", sessionId, "field", field));
            });
        });
    }

    private void clearUserSelections(String sessionId) {
        Set<String> toRemove = activeSelections.entrySet().stream()
                .filter(e -> e.getValue().getSessionId().equals(sessionId))
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
        toRemove.forEach(activeSelections::remove);
    }

    public void broadcastReviewUpdate(String contentId, String reviewJson) {
        messagingTemplate.convertAndSend("/topic/review/" + contentId, reviewJson);
    }

    public void sendNotification(String userId, Notification notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }

    public void broadcastNotification(String contentId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + contentId, notification);
    }

    private void broadcastPresence() {
        List<LiveUser> users = new ArrayList<>(connectedUsers.values());
        messagingTemplate.convertAndSend("/topic/presence", users);
    }

    public List<LiveUser> getConnectedUsers() {
        return new ArrayList<>(connectedUsers.values());
    }

    public Set<String> getUsersInRoom(String contentId) {
        return contentRooms.getOrDefault(contentId, Collections.emptySet());
    }

    public Map<String, ContentSelection> getActiveSelections(String contentId) {
        return activeSelections.entrySet().stream()
                .filter(e -> e.getKey().startsWith(contentId + ":"))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    public Set<ContentReaction> getContentReactions(String contentId) {
        return contentReactions.getOrDefault(contentId, Collections.emptySet());
    }
}
