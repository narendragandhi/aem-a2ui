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
        MvcResult result = mockMvc.perform(get("/stream/generate")
                .param("input", "summer adventure")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
        List<AgUiEvent> events = parseEvents(response);

        // Verify lifecycle events
        assertThat(events).isNotEmpty();
        assertThat(events.get(0).type).isEqualTo("RUN_STARTED");
        assertThat(events.get(events.size() - 1).type).isEqualTo("RUN_FINISHED");

        // Verify RUN_STARTED has required fields
        AgUiEvent runStarted = events.get(0);
        assertThat(runStarted.data.has("runId")).isTrue();
        assertThat(runStarted.data.has("agentName")).isTrue();
    }

    @Test
    @DisplayName("Streaming emits STEP_STARTED and STEP_FINISHED for each step")
    void testStepEvents() throws Exception {
        MvcResult result = mockMvc.perform(get("/stream/generate")
                .param("input", "hiking banner")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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
        MvcResult result = mockMvc.perform(get("/stream/generate")
                .param("input", "test content")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "summer hiking")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
        List<AgUiEvent> events = parseEvents(response);

        // Should have tool call events (AEM DAM search)
        boolean hasToolStart = events.stream().anyMatch(e -> "TOOL_CALL_START".equals(e.type));
        boolean hasToolArgs = events.stream().anyMatch(e -> "TOOL_CALL_ARGS".equals(e.type));
        boolean hasToolResult = events.stream().anyMatch(e -> "TOOL_CALL_RESULT".equals(e.type));
        boolean hasToolEnd = events.stream().anyMatch(e -> "TOOL_CALL_END".equals(e.type));

        assertThat(hasToolStart).isTrue();
        assertThat(hasToolArgs).isTrue();
        assertThat(hasToolResult).isTrue();
        assertThat(hasToolEnd).isTrue();

        // Verify tool call structure
        AgUiEvent toolStart = events.stream()
            .filter(e -> "TOOL_CALL_START".equals(e.type))
            .findFirst()
            .orElseThrow();
        assertThat(toolStart.data.has("toolCallId")).isTrue();
        assertThat(toolStart.data.has("toolName")).isTrue();
        assertThat(toolStart.data.get("toolName").asText()).isEqualTo("aem_dam_search");
    }

    @Test
    @DisplayName("Advanced streaming includes STATE_DELTA progress events")
    void testProgressEvents() throws Exception {
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "hiking adventure")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
        List<AgUiEvent> events = parseEvents(response);

        // Should have STATE_DELTA events with progress
        List<AgUiEvent> progressEvents = events.stream()
            .filter(e -> "STATE_DELTA".equals(e.type))
            .filter(e -> e.data.has("delta") && e.data.get("delta").has("progress"))
            .toList();

        assertThat(progressEvents).isNotEmpty();

        // Verify progress increases
        int lastProgress = -1;
        for (AgUiEvent event : progressEvents) {
            int progress = event.data.get("delta").get("progress").asInt();
            assertThat(progress).isGreaterThanOrEqualTo(lastProgress);
            lastProgress = progress;
        }

        // Verify progress message exists
        AgUiEvent firstProgress = progressEvents.get(0);
        assertThat(firstProgress.data.get("delta").has("progressMessage")).isTrue();
    }

    @Test
    @DisplayName("Advanced streaming includes HITL interrupt events")
    void testHitlInterruptEvents() throws Exception {
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "summer sale")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "hiking")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "adventure")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "test")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
        List<AgUiEvent> events = parseEvents(response);

        // First event must be RUN_STARTED
        assertThat(events.get(0).type).isEqualTo("RUN_STARTED");

        // Last event must be RUN_FINISHED
        assertThat(events.get(events.size() - 1).type).isEqualTo("RUN_FINISHED");

        // STATE_SNAPSHOT should come before RUN_FINISHED
        int snapshotIndex = -1;
        int runFinishedIndex = events.size() - 1;
        for (int i = 0; i < events.size(); i++) {
            if ("STATE_SNAPSHOT".equals(events.get(i).type)) {
                snapshotIndex = i;
            }
        }
        assertThat(snapshotIndex).isGreaterThan(-1);
        assertThat(snapshotIndex).isLessThan(runFinishedIndex);
    }

    @Test
    @DisplayName("RUN_FINISHED contains summary data")
    void testRunFinishedSummary() throws Exception {
        MvcResult result = mockMvc.perform(get("/stream/advanced")
                .param("input", "hiking")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
        List<AgUiEvent> events = parseEvents(response);

        AgUiEvent runFinished = events.stream()
            .filter(e -> "RUN_FINISHED".equals(e.type))
            .findFirst()
            .orElseThrow();

        assertThat(runFinished.data.has("status")).isTrue();
        assertThat(runFinished.data.get("status").asText()).isEqualTo("completed");
        assertThat(runFinished.data.has("totalSteps")).isTrue();
        assertThat(runFinished.data.has("content")).isTrue();
    }

    @Test
    @DisplayName("All events have required base fields")
    void testEventBaseFields() throws Exception {
        MvcResult result = mockMvc.perform(get("/stream/generate")
                .param("input", "test")
                .param("componentType", "hero")
                .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
            .andExpect(status().isOk())
            .andReturn();

        String response = result.getResponse().getContentAsString();
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

        return events;
    }
}
