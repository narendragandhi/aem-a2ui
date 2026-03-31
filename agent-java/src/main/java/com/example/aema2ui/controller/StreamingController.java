package com.example.aema2ui.controller;

import com.example.aema2ui.service.AemIntegrationService;
import com.example.aema2ui.service.BrandConfigService;
import com.example.aema2ui.service.BrandValidationService;
import com.example.aema2ui.service.StreamingContentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * SSE Streaming Controller for real-time content generation.
 *
 * Implements full AG-UI protocol (17 event types):
 *
 * Lifecycle Events:
 * - RUN_STARTED, RUN_FINISHED, RUN_ERROR
 * - STEP_STARTED, STEP_FINISHED
 *
 * Text Message Events:
 * - TEXT_MESSAGE_START, TEXT_MESSAGE_DELTA, TEXT_MESSAGE_END
 *
 * Tool Call Events:
 * - TOOL_CALL_START, TOOL_CALL_ARGS, TOOL_CALL_END, TOOL_CALL_RESULT
 *
 * State Management Events:
 * - STATE_DELTA, STATE_SNAPSHOT, MESSAGES_SNAPSHOT
 *
 * Extension Events:
 * - RAW_EVENT, CUSTOM_EVENT
 */
@Slf4j
@RestController
@RequestMapping("/stream")
@RequiredArgsConstructor
public class StreamingController {

    @Value("${aem.demo.enabled:true}")
    private boolean demoEnabled;

    private final StreamingContentService streamingService;
    private final AemIntegrationService aemIntegrationService;
    private final BrandConfigService brandConfigService;
    private final BrandValidationService brandValidationService;
    private final ObjectMapper objectMapper;

    /**
     * Stream content generation with SSE.
     *
     * Events emitted:
     * - RUN_STARTED: Generation begins
     * - TEXT_MESSAGE_START: Field generation starts
     * - TEXT_MESSAGE_DELTA: Incremental text updates (word by word)
     * - TEXT_MESSAGE_END: Field complete
     * - STATE_DELTA: Complete content state update
     * - RUN_FINISHED: Generation complete
     *
     * Usage from frontend:
     * ```javascript
     * const eventSource = new EventSource('/stream/generate?input=hero+banner&componentType=hero');
     * eventSource.addEventListener('TEXT_MESSAGE_DELTA', (e) => {
     *   const data = JSON.parse(e.data);
     *   updateField(data.data.field, data.data.content);
     * });
     * ```
     */
    @GetMapping(value = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamGenerate(
            @RequestParam String input,
            @RequestParam(required = false) String componentType,
            @RequestParam(required = false, defaultValue = "false") boolean useAi) {

        log.info("Starting SSE stream for input: '{}', componentType: {}, useAi: {}", input, componentType, useAi);

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamContentGeneration(input, componentType, emitter, useAi);

        return emitter;
    }

    /**
     * POST variant for streaming (when input is complex/long).
     */
    @PostMapping(value = "/generate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamGeneratePost(@RequestBody Map<String, Object> request) {
        String input = (String) request.getOrDefault("input", "");
        String componentType = (String) request.get("componentType");
        boolean useAi = Boolean.TRUE.equals(request.get("useAi"));

        log.info("Starting SSE stream (POST) for input: '{}', componentType: {}, useAi: {}", input, componentType, useAi);

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamContentGeneration(input, componentType, emitter, useAi);

        return emitter;
    }

    /**
     * Raw streaming - true token-by-token streaming from LLM.
     * This is as fast as CLI because tokens are sent immediately.
     *
     * Use this for preview/draft content where JSON structure isn't needed.
     */
    @GetMapping(value = "/raw", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamRaw(@RequestParam String prompt) {
        log.info("Starting raw SSE stream for prompt: '{}'", prompt.substring(0, Math.min(50, prompt.length())));

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamRawGeneration(prompt, emitter);

        return emitter;
    }

    /**
     * Advanced streaming with AEM DAM integration.
     *
     * This endpoint demonstrates:
     * - Full AG-UI protocol with all 17 event types
     * - Multi-step workflow with STEP_STARTED/FINISHED
     * - Real AEM DAM search with TOOL_CALL events
     * - STATE_SNAPSHOT for UI recovery
     * - CUSTOM_EVENT for AEM-specific notifications
     *
     * Example: /stream/advanced?input=summer+hiking+adventure&componentType=hero
     */
    @GetMapping(value = "/advanced", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAdvanced(
            @RequestParam String input,
            @RequestParam(required = false, defaultValue = "hero") String componentType) {

        log.info("Starting advanced SSE stream with DAM integration - input: '{}', type: {}, AEM: {}",
            input, componentType, aemIntegrationService.isConnected());

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamWithDamIntegration(input, componentType, emitter, aemIntegrationService);

        return emitter;
    }

    /**
     * POST variant for advanced streaming.
     */
    @PostMapping(value = "/advanced", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAdvancedPost(@RequestBody Map<String, Object> request) {
        String input = (String) request.getOrDefault("input", "");
        String componentType = (String) request.getOrDefault("componentType", "hero");

        log.info("Starting advanced SSE stream (POST) with DAM - input: '{}', type: {}", input, componentType);

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamWithDamIntegration(input, componentType, emitter, aemIntegrationService);

        return emitter;
    }

    /**
     * Health check for streaming endpoint - shows full AG-UI protocol support.
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "ok",
            "streaming", true,
            "protocol", "AG-UI",
            "version", "2.0",
            "aemConnected", aemIntegrationService.isConnected(),
            "events", Map.of(
                "lifecycle", List.of("RUN_STARTED", "RUN_FINISHED", "RUN_ERROR", "STEP_STARTED", "STEP_FINISHED"),
                "textMessage", List.of("TEXT_MESSAGE_START", "TEXT_MESSAGE_DELTA", "TEXT_MESSAGE_END"),
                "toolCall", List.of("TOOL_CALL_START", "TOOL_CALL_ARGS", "TOOL_CALL_END", "TOOL_CALL_RESULT"),
                "state", List.of("STATE_DELTA", "STATE_SNAPSHOT", "MESSAGES_SNAPSHOT"),
                "extension", List.of("RAW_EVENT", "CUSTOM_EVENT"),
                "hitl", List.of("INTERRUPT_REQUESTED", "INTERRUPT_RESOLVED")
            ),
            "endpoints", Map.of(
                "basic", "/stream/generate",
                "advanced", "/stream/advanced",
                "raw", "/stream/raw"
            )
        );
    }

    /**
     * Governance streaming - brand + SEO policy copilot.
     * Accepts base64-encoded content JSON in the "content" query param.
     */
    @GetMapping(value = "/governance", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamGovernance(
            @RequestParam String content,
            @RequestParam(required = false) String brandId) {

        if (!demoEnabled) {
            SseEmitter emitter = new SseEmitter();
            emitter.complete();
            return emitter;
        }

        SseEmitter emitter = streamingService.createEmitter();
        streamingService.streamGovernance(content, brandId, emitter, brandConfigService, brandValidationService, objectMapper);
        return emitter;
    }
}
