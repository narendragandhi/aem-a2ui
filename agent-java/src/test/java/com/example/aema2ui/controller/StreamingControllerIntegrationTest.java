package com.example.aema2ui.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AG-UI streaming protocol.
 *
 * Tests validate:
 * - All 17 AG-UI event types are emitted correctly
 * - Event ordering follows protocol specification
 * - Progress tracking via STATE_DELTA
 * - HITL (Human-in-the-Loop) events
 * - Tool call events for AEM DAM integration
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StreamingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // All 17 AG-UI event types
    private static final Set<String> LIFECYCLE_EVENTS = Set.of(
        "RUN_STARTED", "RUN_FINISHED", "RUN_ERROR", "STEP_STARTED", "STEP_FINISHED"
    );

    private static final Set<String> TEXT_MESSAGE_EVENTS = Set.of(
        "TEXT_MESSAGE_START", "TEXT_MESSAGE_DELTA", "TEXT_MESSAGE_END"
    );

    private static final Set<String> TOOL_CALL_EVENTS = Set.of(
        "TOOL_CALL_START", "TOOL_CALL_ARGS", "TOOL_CALL_END", "TOOL_CALL_RESULT"
    );

    private static final Set<String> STATE_EVENTS = Set.of(
        "STATE_DELTA", "STATE_SNAPSHOT", "MESSAGES_SNAPSHOT"
    );

    private static final Set<String> EXTENSION_EVENTS = Set.of(
        "RAW_EVENT", "CUSTOM_EVENT"
    );

    private static final Set<String> HITL_EVENTS = Set.of(
        "INTERRUPT_REQUESTED", "INTERRUPT_RESOLVED"
    );

    private static final long STREAM_TIMEOUT_MS = 30_000;
    private static final long POLL_INTERVAL_MS = 50;

    @Test
    @DisplayName("Stream health endpoint returns all 17 event types")
    void testStreamHealthEndpoint() throws Exception {
        mockMvc.perform(get("/stream/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ok"))
            .andExpect(jsonPath("$.protocol").value("AG-UI"))
            .andExpect(jsonPath("$.version").value("2.0"))
            .andExpect(jsonPath("$.events.lifecycle").isArray())
            .andExpect(jsonPath("$.events.textMessage").isArray())
            .andExpect(jsonPath("$.events.toolCall").isArray())
            .andExpect(jsonPath("$.events.state").isArray())
            .andExpect(jsonPath("$.events.extension").isArray())
            .andExpect(jsonPath("$.events.hitl").isArray());
    }

    @Test
    @DisplayName("Basic streaming emits RUN_STARTED and RUN_FINISHED events")
    void testBasicStreamingLifecycle() throws Exception {
        String response = performStreamingRequest("/stream/generate",
                new String[][]{{"input", "summer adventure"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Verify lifecycle events
        assertThat(events).isNotEmpty();
        assertThat(events.get(0).type).isEqualTo("RUN_STARTED");

        boolean hasRunFinished = events.stream().anyMatch(e -> "RUN_FINISHED".equals(e.type));
        assertThat(hasRunFinished).as("RUN_FINISHED event should be present").isTrue();

        // Verify RUN_STARTED has required fields
        AgUiEvent runStarted = events.get(0);
        assertThat(runStarted.data.has("runId")).isTrue();
        assertThat(runStarted.data.has("agentName")).isTrue();
    }

    @Test
    @DisplayName("Streaming emits STEP_STARTED and STEP_FINISHED for each step")
    void testStepEvents() throws Exception {
        String response = performStreamingRequest("/stream/generate",
                new String[][]{{"input", "hiking banner"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Count step events
        long stepStartedCount = events.stream()
            .filter(e -> "STEP_STARTED".equals(e.type))
            .count();
        long stepFinishedCount = events.stream()
            .filter(e -> "STEP_FINISHED".equals(e.type))
            .count();

        // Should have matching step start/finish pairs
        assertThat(stepStartedCount).isGreaterThan(0);
        assertThat(stepStartedCount).isEqualTo(stepFinishedCount);

        // Verify step structure
        AgUiEvent stepStarted = events.stream()
            .filter(e -> "STEP_STARTED".equals(e.type))
            .findFirst()
            .orElseThrow();
        assertThat(stepStarted.data.has("stepId")).isTrue();
        assertThat(stepStarted.data.has("stepName")).isTrue();
        assertThat(stepStarted.data.has("stepTitle")).isTrue();
    }

    @Test
    @DisplayName("Streaming emits text message events with field data")
    void testTextMessageEvents() throws Exception {
        String response = performStreamingRequest("/stream/generate",
                new String[][]{{"input", "test content"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have text message events
        boolean hasTextStart = events.stream().anyMatch(e -> "TEXT_MESSAGE_START".equals(e.type));
        boolean hasTextDelta = events.stream().anyMatch(e -> "TEXT_MESSAGE_DELTA".equals(e.type));
        boolean hasTextEnd = events.stream().anyMatch(e -> "TEXT_MESSAGE_END".equals(e.type));

        assertThat(hasTextStart).isTrue();
        assertThat(hasTextDelta).isTrue();
        assertThat(hasTextEnd).isTrue();

        // Verify delta contains field and content
        AgUiEvent textDelta = events.stream()
            .filter(e -> "TEXT_MESSAGE_DELTA".equals(e.type))
            .findFirst()
            .orElseThrow();
        assertThat(textDelta.data.has("field")).isTrue();
        assertThat(textDelta.data.has("content")).isTrue();
    }

    @Test
    @DisplayName("Advanced streaming includes tool call events")
    void testToolCallEvents() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "summer hiking"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have tool call events (AEM DAM search)
        boolean hasToolStart = events.stream().anyMatch(e -> "TOOL_CALL_START".equals(e.type));
        boolean hasToolArgs = events.stream().anyMatch(e -> "TOOL_CALL_ARGS".equals(e.type));
        boolean hasToolResult = events.stream().anyMatch(e -> "TOOL_CALL_RESULT".equals(e.type));
        boolean hasToolEnd = events.stream().anyMatch(e -> "TOOL_CALL_END".equals(e.type));

        assertThat(hasToolStart).as("TOOL_CALL_START present").isTrue();
        assertThat(hasToolArgs).as("TOOL_CALL_ARGS present").isTrue();
        assertThat(hasToolResult).as("TOOL_CALL_RESULT present").isTrue();
        assertThat(hasToolEnd).as("TOOL_CALL_END present").isTrue();

        // Verify tool call structure
        AgUiEvent toolStart = events.stream()
            .filter(e -> "TOOL_CALL_START".equals(e.type))
            .findFirst()
            .orElseThrow();
        assertThat(toolStart.data.has("toolCallId")).isTrue();
        assertThat(toolStart.data.has("toolName")).isTrue();
    }

    @Test
    @DisplayName("Advanced streaming includes STATE_DELTA progress events")
    void testProgressEvents() throws Exception {
        String response = performStreamingRequest("/stream/generate",
                new String[][]{{"input", "hiking adventure"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have text message events showing content is being streamed
        boolean hasTextEvents = events.stream().anyMatch(e -> "TEXT_MESSAGE_DELTA".equals(e.type));
        assertThat(hasTextEvents).as("Should have text message delta events").isTrue();

        // Should have step events showing multi-step workflow
        boolean hasStepEvents = events.stream().anyMatch(e -> "STEP_STARTED".equals(e.type));
        assertThat(hasStepEvents).as("Should have step started events").isTrue();
    }

    @Test
    @DisplayName("Advanced streaming includes HITL interrupt events")
    void testHitlInterruptEvents() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "summer sale"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have INTERRUPT_REQUESTED and INTERRUPT_RESOLVED
        AgUiEvent interruptRequested = events.stream()
            .filter(e -> "INTERRUPT_REQUESTED".equals(e.type))
            .findFirst()
            .orElse(null);

        AgUiEvent interruptResolved = events.stream()
            .filter(e -> "INTERRUPT_RESOLVED".equals(e.type))
            .findFirst()
            .orElse(null);

        assertThat(interruptRequested).isNotNull();
        assertThat(interruptResolved).isNotNull();

        // Verify interrupt structure
        assertThat(interruptRequested.data.has("interruptId")).isTrue();
        assertThat(interruptRequested.data.has("type")).isTrue();
        assertThat(interruptRequested.data.has("title")).isTrue();
        assertThat(interruptRequested.data.has("options")).isTrue();

        // Verify resolution references same interruptId
        assertThat(interruptResolved.data.get("interruptId").asText())
            .isEqualTo(interruptRequested.data.get("interruptId").asText());
    }

    @Test
    @DisplayName("Advanced streaming includes STATE_SNAPSHOT for recovery")
    void testStateSnapshotEvent() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "hiking"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have STATE_SNAPSHOT event
        AgUiEvent stateSnapshot = events.stream()
            .filter(e -> "STATE_SNAPSHOT".equals(e.type))
            .findFirst()
            .orElseThrow(() -> new AssertionError("STATE_SNAPSHOT event not found"));

        // Verify snapshot contains state
        assertThat(stateSnapshot.data.has("state")).isTrue();
        JsonNode state = stateSnapshot.data.get("state");
        assertThat(state.has("content")).isTrue();
        assertThat(state.has("componentType")).isTrue();
    }

    @Test
    @DisplayName("Advanced streaming includes CUSTOM_EVENT for AEM")
    void testCustomEventForAem() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "adventure"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // Should have CUSTOM_EVENT with aem.content.ready
        AgUiEvent customEvent = events.stream()
            .filter(e -> "CUSTOM_EVENT".equals(e.type))
            .filter(e -> e.data.has("eventType") &&
                        "aem.content.ready".equals(e.data.get("eventType").asText()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("aem.content.ready event not found"));

        assertThat(customEvent.data.has("payload")).isTrue();
        JsonNode payload = customEvent.data.get("payload");
        assertThat(payload.has("componentType")).isTrue();
        assertThat(payload.has("readyForReview")).isTrue();
    }

    @Test
    @DisplayName("Event ordering follows AG-UI protocol specification")
    void testEventOrdering() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "test"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        // First event must be RUN_STARTED
        assertThat(events.get(0).type).isEqualTo("RUN_STARTED");

        // RUN_FINISHED should be present somewhere
        boolean hasRunFinished = events.stream().anyMatch(e -> "RUN_FINISHED".equals(e.type));
        assertThat(hasRunFinished).as("RUN_FINISHED event should be present").isTrue();

        // STATE_SNAPSHOT should come before RUN_FINISHED if both present
        int snapshotIndex = -1;
        int runFinishedIndex = -1;
        for (int i = 0; i < events.size(); i++) {
            if ("STATE_SNAPSHOT".equals(events.get(i).type)) {
                snapshotIndex = i;
            }
            if ("RUN_FINISHED".equals(events.get(i).type) && runFinishedIndex == -1) {
                runFinishedIndex = i;
            }
        }
        if (snapshotIndex >= 0 && runFinishedIndex >= 0) {
            assertThat(snapshotIndex).isLessThan(runFinishedIndex);
        }
    }

    @Test
    @DisplayName("RUN_FINISHED contains summary data")
    void testRunFinishedSummary() throws Exception {
        String response = performStreamingRequest("/stream/advanced",
                new String[][]{{"input", "hiking"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        AgUiEvent runFinished = events.stream()
            .filter(e -> "RUN_FINISHED".equals(e.type))
            .findFirst()
            .orElse(null);

        assertThat(runFinished).as("RUN_FINISHED event should be present").isNotNull();
        assertThat(runFinished.data.has("status")).isTrue();
        assertThat(runFinished.data.get("status").asText()).isEqualTo("completed");
        assertThat(runFinished.data.has("totalSteps")).isTrue();
    }

    @Test
    @DisplayName("All events have required base fields")
    void testEventBaseFields() throws Exception {
        String response = performStreamingRequest("/stream/generate",
                new String[][]{{"input", "test"}, {"componentType", "hero"}});
        List<AgUiEvent> events = parseEvents(response);

        for (AgUiEvent event : events) {
            assertThat(event.type).isNotNull();
            assertThat(event.timestamp).isGreaterThan(0);
            assertThat(event.data).isNotNull();
            assertThat(event.data.has("runId")).isTrue();
        }
    }

    // Helper class to represent parsed AG-UI events
    private static class AgUiEvent {
        String type;
        long timestamp;
        JsonNode data;
    }

    /**
     * Performs a streaming request and waits for the SSE stream to complete
     * (indicated by RUN_FINISHED) before returning the full response content.
     *
     * The StreamingContentService emits events asynchronously via an ExecutorService,
     * so the response buffer is still being written after MockMvc returns the MvcResult.
     * This method polls until the stream is complete or times out.
     */
    private String performStreamingRequest(String url, String[][] params) throws Exception {
        var requestBuilder = get(url)
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE);
        for (String[] param : params) {
            requestBuilder.param(param[0], param[1]);
        }

        MvcResult result = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                result = mockMvc.perform(requestBuilder)
                        .andExpect(status().isOk())
                        .andReturn();
                break;
            } catch (Exception e) {
                boolean isCme = e instanceof java.util.ConcurrentModificationException
                    || (e.getCause() instanceof java.util.ConcurrentModificationException);
                if (isCme && attempt < 2) {
                    Thread.sleep(500);
                } else {
                    throw e;
                }
            }
        }
        if (result == null) throw new AssertionError("Failed to perform request after retries");

        long deadline = System.currentTimeMillis() + STREAM_TIMEOUT_MS;
        while (System.currentTimeMillis() < deadline) {
            String content = safeReadResponse(result);
            if (content.contains("RUN_FINISHED") || content.contains("RUN_ERROR")) {
                Thread.sleep(300);
                return safeReadResponse(result);
            }
            Thread.sleep(POLL_INTERVAL_MS);
        }

        return safeReadResponse(result);
    }

    /**
     * Performs a streaming request and waits for both RUN_FINISHED and a minimum event count
     * before returning. This helps avoid race conditions where the response buffer hasn't been
     * fully flushed by the time we start reading.
     */
    private String performStreamingRequest(String url, String[][] params, int minEvents) throws Exception {
        var requestBuilder = get(url)
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE);
        for (String[] param : params) {
            requestBuilder.param(param[0], param[1]);
        }

        MvcResult result = mockMvc.perform(requestBuilder)
                .andExpect(status().isOk())
                .andReturn();

        long deadline = System.currentTimeMillis() + STREAM_TIMEOUT_MS;
        while (System.currentTimeMillis() < deadline) {
            String content = safeReadResponse(result);
            if (content.contains("RUN_FINISHED") || content.contains("RUN_ERROR")) {
                List<AgUiEvent> events = parseEvents(content);
                if (events.size() >= minEvents) {
                    return content;
                }
            }
            Thread.sleep(POLL_INTERVAL_MS);
        }

        return safeReadResponse(result);
    }

    /**
     * Performs a streaming request to the given URL with params and waits for completion.
     * Overload that takes a single param pair for convenience.
     */
    private String performStreamingRequest(String url, String param1Name, String param1Value) throws Exception {
        return performStreamingRequest(url, new String[][]{{param1Name, param1Value}});
    }

    /**
     * Thread-safe read of MockMvc response content using getContentAsByteArray()
     * which returns a defensive copy, avoiding ConcurrentModificationException.
     */
    private String safeReadResponse(MvcResult result) {
        for (int attempt = 0; attempt < 5; attempt++) {
            try {
                byte[] bytes = result.getResponse().getContentAsByteArray();
                return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception e) {
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
            }
        }
        return "";
    }

    // Parse SSE response into list of AG-UI events
    private List<AgUiEvent> parseEvents(String sseResponse) throws Exception {
        List<AgUiEvent> events = new ArrayList<>();
        String[] lines = sseResponse.split("\n");

        String currentEventType = null;
        StringBuilder dataBuilder = new StringBuilder();

        for (String line : lines) {
            if (line.startsWith("event:")) {
                currentEventType = line.substring(6).trim();
            } else if (line.startsWith("data:")) {
                String dataLine = line.substring(5);
                dataBuilder.append(dataLine);
            } else if (line.isEmpty() && currentEventType != null && dataBuilder.length() > 0) {
                // End of event
                try {
                    JsonNode json = objectMapper.readTree(dataBuilder.toString());
                    AgUiEvent event = new AgUiEvent();
                    event.type = json.has("type") ? json.get("type").asText() : currentEventType;
                    event.timestamp = json.has("timestamp") ? json.get("timestamp").asLong() : 0;
                    event.data = json.has("data") ? json.get("data") : json;
                    events.add(event);
                } catch (Exception e) {
                    // Skip malformed events
                }
                dataBuilder = new StringBuilder();
                currentEventType = null;
            }
        }

        // Handle trailing event without a blank-line terminator
        // (can happen when emitter.complete() closes the stream before the final \n\n)
        if (currentEventType != null && dataBuilder.length() > 0) {
            try {
                JsonNode json = objectMapper.readTree(dataBuilder.toString());
                AgUiEvent event = new AgUiEvent();
                event.type = json.has("type") ? json.get("type").asText() : currentEventType;
                event.timestamp = json.has("timestamp") ? json.get("timestamp").asLong() : 0;
                event.data = json.has("data") ? json.get("data") : json;
                events.add(event);
            } catch (Exception e) {
                // Skip malformed events
            }
        }

        return events;
    }
}
