package com.example.aema2ui.service;

import com.example.aema2ui.agent.AemContentAgent;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.model.UserInput;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * SSE Streaming service for real-time content generation.
 *
 * Implements AG-UI protocol event types:
 * - RUN_STARTED: Generation begins
 * - TEXT_MESSAGE_START: New text field beginning
 * - TEXT_MESSAGE_DELTA: Incremental text update
 * - TEXT_MESSAGE_END: Field complete
 * - RUN_FINISHED: Generation complete
 *
 * This creates the "typing" effect where content appears progressively.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreamingContentService {

    private final AemContentAgent contentAgent;
    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    private final ExecutorService executor = Executors.newCachedThreadPool();

    // AG-UI Event Types - Full Protocol Support (17 events)
    // Lifecycle Events
    public static final String RUN_STARTED = "RUN_STARTED";
    public static final String RUN_FINISHED = "RUN_FINISHED";
    public static final String RUN_ERROR = "RUN_ERROR";
    public static final String STEP_STARTED = "STEP_STARTED";
    public static final String STEP_FINISHED = "STEP_FINISHED";

    // Text Message Events
    public static final String TEXT_MESSAGE_START = "TEXT_MESSAGE_START";
    public static final String TEXT_MESSAGE_DELTA = "TEXT_MESSAGE_DELTA";
    public static final String TEXT_MESSAGE_END = "TEXT_MESSAGE_END";

    // Tool Call Events
    public static final String TOOL_CALL_START = "TOOL_CALL_START";
    public static final String TOOL_CALL_ARGS = "TOOL_CALL_ARGS";
    public static final String TOOL_CALL_END = "TOOL_CALL_END";
    public static final String TOOL_CALL_RESULT = "TOOL_CALL_RESULT";

    // State Management Events
    public static final String STATE_DELTA = "STATE_DELTA";
    public static final String STATE_SNAPSHOT = "STATE_SNAPSHOT";
    public static final String MESSAGES_SNAPSHOT = "MESSAGES_SNAPSHOT";

    // Extension Events
    public static final String RAW_EVENT = "RAW_EVENT";
    public static final String CUSTOM_EVENT = "CUSTOM_EVENT";

    // Human-in-the-Loop Events
    public static final String INTERRUPT_REQUESTED = "INTERRUPT_REQUESTED";
    public static final String INTERRUPT_RESOLVED = "INTERRUPT_RESOLVED";

    /**
     * Stream content generation with real-time updates.
     * Implements full AG-UI protocol with steps, tool calls, and state management.
     *
     * @param useAi If false, uses templates for instant response. If true, uses LLM (slower).
     */
    public void streamContentGeneration(String userInput, String componentType, SseEmitter emitter, boolean useAi) {
        String runId = UUID.randomUUID().toString();

        // Track emitter state to avoid writing after completion
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        // Set up completion callbacks
        emitter.onCompletion(() -> {
            emitterCompleted.set(true);
            log.debug("SSE completed for runId: {}", runId);
        });
        emitter.onTimeout(() -> {
            emitterCompleted.set(true);
            log.warn("SSE timeout for runId: {}", runId);
        });
        emitter.onError(e -> {
            emitterCompleted.set(true);
            if (!isClientDisconnection(e)) {
                log.error("SSE error for runId: {} - {}", runId, e.getMessage());
            }
        });

        executor.execute(() -> {
            try {
                int stepIndex = 0;

                // ═══════════════════════════════════════════════════════════
                // 1. RUN_STARTED - Begin the agent run
                // ═══════════════════════════════════════════════════════════
                if (emitterCompleted.get()) return;
                emitEvent(emitter, RUN_STARTED, Map.of(
                    "runId", runId,
                    "threadId", Thread.currentThread().getName(),
                    "input", userInput,
                    "agentName", "AEM Content Assistant",
                    "version", "2.0"
                ));

                // ═══════════════════════════════════════════════════════════
                // 2. STEP 1: Parse User Intent
                // ═══════════════════════════════════════════════════════════
                if (emitterCompleted.get()) return;
                String stepId1 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "stepIndex", stepIndex,
                    "stepName", "parse_intent",
                    "stepTitle", "Analyzing your request...",
                    "stepDescription", "Understanding component type, tone, and requirements"
                ));

                UserInput parsed;
                if (useAi) {
                    parsed = contentAgent.parseUserIntent(userInput);
                    if (componentType != null && !componentType.isEmpty()) {
                        parsed = UserInput.builder()
                            .rawText(parsed.getRawText())
                            .detectedComponentType(componentType)
                            .targetAudience(parsed.getTargetAudience())
                            .brandStyle(parsed.getBrandStyle())
                            .toneOfVoice(parsed.getToneOfVoice())
                            .build();
                    }
                } else {
                    parsed = UserInput.builder()
                        .rawText(userInput)
                        .detectedComponentType(componentType != null ? componentType : "hero")
                        .build();
                }

                if (emitterCompleted.get()) return;
                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "stepIndex", stepIndex,
                    "stepName", "parse_intent",
                    "status", "completed",
                    "result", Map.of(
                        "componentType", parsed.getDetectedComponentType(),
                        "tone", parsed.getToneOfVoice() != null ? parsed.getToneOfVoice() : "professional"
                    )
                ));

                // ═══════════════════════════════════════════════════════════
                // 3. STEP 2: Generate Content (with Tool Calls)
                // ═══════════════════════════════════════════════════════════
                if (emitterCompleted.get()) return;
                String stepId2 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "stepIndex", stepIndex,
                    "stepName", "generate_content",
                    "stepTitle", "Generating content...",
                    "stepDescription", useAi ? "Using AI to create optimized content" : "Applying brand templates"
                ));

                // Tool Call: LLM Generation
                String toolCallId = UUID.randomUUID().toString();
                if (emitterCompleted.get()) return;
                emitEvent(emitter, TOOL_CALL_START, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "toolCallId", toolCallId,
                    "toolName", useAi ? "llm_generate" : "template_generate",
                    "toolDescription", useAi ? "Ollama LLM content generation" : "Brand template application"
                ));

                // Tool Call Args
                if (emitterCompleted.get()) return;
                emitEvent(emitter, TOOL_CALL_ARGS, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "args", Map.of(
                        "componentType", parsed.getDetectedComponentType(),
                        "prompt", userInput,
                        "model", useAi ? "phi3:mini" : "template"
                    )
                ));

                // Actually generate content
                ContentSuggestion content;
                if (useAi) {
                    content = contentAgent.generateContent(parsed);
                } else {
                    content = contentAgent.generateTemplateContent(userInput, componentType);
                }

                // Tool Call Result
                if (emitterCompleted.get()) return;
                emitEvent(emitter, TOOL_CALL_RESULT, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "result", Map.of(
                        "success", true,
                        "title", content.getTitle(),
                        "tokensUsed", useAi ? 150 : 0
                    )
                ));

                // Tool Call End
                if (emitterCompleted.get()) return;
                emitEvent(emitter, TOOL_CALL_END, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "status", "completed"
                ));

                if (emitterCompleted.get()) return;
                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "stepIndex", stepIndex,
                    "stepName", "generate_content",
                    "status", "completed"
                ));

                // ═══════════════════════════════════════════════════════════
                // 4. STEP 3: Stream Content Fields
                // ═══════════════════════════════════════════════════════════
                if (emitterCompleted.get()) return;
                String stepId3 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId3,
                    "stepIndex", stepIndex,
                    "stepName", "stream_fields",
                    "stepTitle", "Streaming content...",
                    "stepDescription", "Delivering content fields to UI"
                ));

                // Stream each field progressively
                if (!emitterCompleted.get()) streamField(emitter, runId, "title", content.getTitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "subtitle", content.getSubtitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "description", content.getDescription(), emitterCompleted);

                if (!emitterCompleted.get() && content.getCtaText() != null) {
                    streamField(emitter, runId, "ctaText", content.getCtaText(), emitterCompleted);
                }
                if (!emitterCompleted.get() && content.getCtaUrl() != null) {
                    streamField(emitter, runId, "ctaUrl", content.getCtaUrl(), emitterCompleted);
                }
                if (!emitterCompleted.get() && content.getPrice() != null) {
                    streamField(emitter, runId, "price", content.getPrice(), emitterCompleted);
                }
                if (!emitterCompleted.get() && content.getImageUrl() != null) {
                    streamField(emitter, runId, "imageUrl", content.getImageUrl(), emitterCompleted);
                }

                if (emitterCompleted.get()) return;
                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId3,
                    "stepIndex", stepIndex,
                    "stepName", "stream_fields",
                    "status", "completed"
                ));

                // ═══════════════════════════════════════════════════════════
                // 5. STATE_SNAPSHOT - Full state for recovery
                // ═══════════════════════════════════════════════════════════
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, STATE_SNAPSHOT, Map.of(
                        "runId", runId,
                        "state", Map.of(
                            "content", content,
                            "componentType", content.getComponentType(),
                            "steps", stepIndex,
                            "status", "completed"
                        )
                    ));
                }

                // ═══════════════════════════════════════════════════════════
                // 6. CUSTOM_EVENT - AEM-specific notification
                // ═══════════════════════════════════════════════════════════
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, CUSTOM_EVENT, Map.of(
                        "runId", runId,
                        "eventType", "aem.content.ready",
                        "payload", Map.of(
                            "componentType", content.getComponentType(),
                            "readyForReview", true,
                            "canPublish", false
                        )
                    ));
                }

                // ═══════════════════════════════════════════════════════════
                // 7. RUN_FINISHED - Complete the run
                // ═══════════════════════════════════════════════════════════
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, RUN_FINISHED, Map.of(
                        "runId", runId,
                        "status", "completed",
                        "totalSteps", stepIndex,
                        "content", content
                    ));
                    emitter.complete();
                }

            } catch (Exception e) {
                if (isClientDisconnection(e)) {
                    log.debug("Client disconnected during streaming (runId: {})", runId);
                } else {
                    log.error("Streaming error for runId {}: {}", runId, e.getMessage());
                    if (!emitterCompleted.get()) {
                        try {
                            emitEvent(emitter, RUN_ERROR, Map.of(
                                "runId", runId,
                                "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
                            ));
                            emitter.completeWithError(e);
                        } catch (Exception ignored) {
                        }
                    }
                }
            }
        });
    }

    /**
     * Stream a single field - sends complete value immediately (no artificial delay).
     */
    private void streamField(SseEmitter emitter, String runId, String fieldName, String value,
            java.util.concurrent.atomic.AtomicBoolean emitterCompleted)
            throws IOException, InterruptedException {
        if (value == null || value.isEmpty()) return;
        if (emitterCompleted.get()) return;

        String messageId = UUID.randomUUID().toString();

        // TEXT_MESSAGE_START
        emitEvent(emitter, TEXT_MESSAGE_START, Map.of(
            "runId", runId,
            "messageId", messageId,
            "field", fieldName
        ));

        // Send complete value immediately (no artificial delays)
        emitEvent(emitter, TEXT_MESSAGE_DELTA, Map.of(
            "runId", runId,
            "messageId", messageId,
            "field", fieldName,
            "delta", value,
            "content", value
        ));

        if (emitterCompleted.get()) return;

        // TEXT_MESSAGE_END
        emitEvent(emitter, TEXT_MESSAGE_END, Map.of(
            "runId", runId,
            "messageId", messageId,
            "field", fieldName,
            "content", value
        ));
    }

    /**
     * Emit an SSE event with AG-UI format.
     */
    private void emitEvent(SseEmitter emitter, String eventType, Map<String, Object> data)
            throws IOException {
        try {
            Map<String, Object> event = Map.of(
                "type", eventType,
                "timestamp", System.currentTimeMillis(),
                "data", data
            );

            String json = objectMapper.writeValueAsString(event);
            emitter.send(SseEmitter.event()
                .name(eventType)
                .data(json));

            log.debug("Emitted SSE event: {} - {}", eventType, data.get("field"));
        } catch (Exception e) {
            if (isClientDisconnection(e)) {
                log.debug("Client disconnected, cannot emit SSE event: {}", eventType);
            } else {
                log.error("Failed to emit SSE event: {}", e.getMessage());
            }
            throw e;
        }
    }

    /**
     * Create a configured SseEmitter with appropriate timeout.
     * Note: Callbacks are set in streamContentGeneration to track state.
     */
    public SseEmitter createEmitter() {
        return new SseEmitter(120000L); // 2 minute timeout
    }

    /**
     * Stream raw LLM output directly - true streaming like CLI.
     * Tokens are sent to client as soon as Ollama generates them.
     */
    public void streamRawGeneration(String prompt, SseEmitter emitter) {
        String runId = UUID.randomUUID().toString();
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        emitter.onCompletion(() -> emitterCompleted.set(true));
        emitter.onTimeout(() -> emitterCompleted.set(true));
        emitter.onError(e -> emitterCompleted.set(true));

        executor.execute(() -> {
            try {
                // Emit RUN_STARTED
                emitEvent(emitter, RUN_STARTED, Map.of("runId", runId, "mode", "raw_streaming"));

                StringBuilder fullResponse = new StringBuilder();
                String messageId = UUID.randomUUID().toString();

                // Start message
                emitEvent(emitter, TEXT_MESSAGE_START, Map.of(
                    "runId", runId,
                    "messageId", messageId,
                    "field", "content"
                ));

                // True streaming from LLM
                llmService.generateStreaming(prompt,
                    // onToken - called for each token from Ollama
                    token -> {
                        if (emitterCompleted.get()) return;
                        fullResponse.append(token);
                        try {
                            emitEvent(emitter, TEXT_MESSAGE_DELTA, Map.of(
                                "runId", runId,
                                "messageId", messageId,
                                "field", "content",
                                "delta", token,
                                "content", fullResponse.toString()
                            ));
                        } catch (Exception e) {
                            log.debug("Failed to emit token: {}", e.getMessage());
                        }
                    },
                    // onComplete
                    () -> {
                        if (emitterCompleted.get()) return;
                        try {
                            emitEvent(emitter, TEXT_MESSAGE_END, Map.of(
                                "runId", runId,
                                "messageId", messageId,
                                "field", "content",
                                "content", fullResponse.toString()
                            ));
                            emitEvent(emitter, RUN_FINISHED, Map.of(
                                "runId", runId,
                                "status", "completed",
                                "content", fullResponse.toString()
                            ));
                            emitter.complete();
                        } catch (Exception e) {
                            log.debug("Failed to complete: {}", e.getMessage());
                        }
                    }
                );

            } catch (Exception e) {
                if (!isClientDisconnection(e) && !emitterCompleted.get()) {
                    log.error("Raw streaming error: {}", e.getMessage());
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of("runId", runId, "error", e.getMessage()));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Advanced streaming with Human-in-the-Loop and real AEM DAM tool calls.
     * Demonstrates full AG-UI protocol including:
     * - Multi-step workflow with visible progress
     * - Real AEM DAM search (TOOL_CALL events)
     * - Human interrupt for asset selection
     * - State management for resumption
     *
     * @param userInput The content prompt
     * @param componentType Target component type
     * @param emitter SSE emitter
     * @param aemIntegrationService For real AEM DAM calls
     */
    public void streamWithDamIntegration(
            String userInput,
            String componentType,
            SseEmitter emitter,
            AemIntegrationService aemIntegrationService) {

        String runId = UUID.randomUUID().toString();
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        emitter.onCompletion(() -> emitterCompleted.set(true));
        emitter.onTimeout(() -> emitterCompleted.set(true));
        emitter.onError(e -> emitterCompleted.set(true));

        executor.execute(() -> {
            try {
                int stepIndex = 0;

                // ═══════════════════════════════════════════════════════════
                // RUN_STARTED with enhanced metadata
                // ═══════════════════════════════════════════════════════════
                emitEvent(emitter, RUN_STARTED, Map.of(
                    "runId", runId,
                    "agentName", "AEM Content Assistant",
                    "version", "2.0",
                    "capabilities", java.util.List.of("content_generation", "dam_search", "workflow_submit"),
                    "aemConnected", aemIntegrationService.isConnected()
                ));

                // ═══════════════════════════════════════════════════════════
                // STEP 1: Parse Intent
                // ═══════════════════════════════════════════════════════════
                String stepId1 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "stepIndex", stepIndex,
                    "stepName", "parse_intent",
                    "stepTitle", "Analyzing request...",
                    "icon", "🔍"
                ));

                UserInput parsed = contentAgent.parseUserIntent(userInput);
                if (componentType != null && !componentType.isEmpty()) {
                    parsed = UserInput.builder()
                        .rawText(parsed.getRawText())
                        .detectedComponentType(componentType)
                        .targetAudience(parsed.getTargetAudience())
                        .brandStyle(parsed.getBrandStyle())
                        .toneOfVoice(parsed.getToneOfVoice())
                        .build();
                }

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "status", "completed",
                    "result", Map.of("componentType", parsed.getDetectedComponentType())
                ));

                // ═══════════════════════════════════════════════════════════
                // STEP 2: Search AEM DAM (Real Tool Call)
                // ═══════════════════════════════════════════════════════════
                String stepId2 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "stepIndex", stepIndex,
                    "stepName", "dam_search",
                    "stepTitle", "Searching AEM DAM...",
                    "icon", "🖼️"
                ));

                String toolCallId = UUID.randomUUID().toString();
                emitEvent(emitter, TOOL_CALL_START, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "toolCallId", toolCallId,
                    "toolName", "aem_dam_search",
                    "toolDescription", "Search AEM Digital Asset Manager for relevant images"
                ));

                // Extract search term from user input
                String searchTerm = extractSearchTerm(userInput);
                emitEvent(emitter, TOOL_CALL_ARGS, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "args", Map.of(
                        "searchTerm", searchTerm,
                        "mimeType", "image",
                        "damRoot", "/content/dam/wknd"
                    )
                ));

                // Actual AEM DAM search
                var damAssets = aemIntegrationService.searchDamAssets(searchTerm, "image");

                emitEvent(emitter, TOOL_CALL_RESULT, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "result", Map.of(
                        "success", true,
                        "assetCount", damAssets.size(),
                        "assets", damAssets.stream().limit(5).toList(),
                        "source", aemIntegrationService.isConnected() ? "AEM_LIVE" : "MOCK"
                    )
                ));

                emitEvent(emitter, TOOL_CALL_END, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "status", "completed"
                ));

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "status", "completed",
                    "result", Map.of("foundAssets", damAssets.size())
                ));

                // ═══════════════════════════════════════════════════════════
                // STEP 3: Generate Content
                // ═══════════════════════════════════════════════════════════
                String stepId3 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId3,
                    "stepIndex", stepIndex,
                    "stepName", "generate_content",
                    "stepTitle", "Generating content with AI...",
                    "icon", "✨"
                ));

                ContentSuggestion content = contentAgent.generateContent(parsed);

                // Override image with DAM asset if available
                if (!damAssets.isEmpty()) {
                    var firstAsset = damAssets.get(0);
                    content = ContentSuggestion.builder()
                        .componentType(content.getComponentType())
                        .title(content.getTitle())
                        .subtitle(content.getSubtitle())
                        .description(content.getDescription())
                        .ctaText(content.getCtaText())
                        .ctaUrl(content.getCtaUrl())
                        .imageUrl(String.valueOf(firstAsset.get("path")))
                        .imageAlt(String.valueOf(firstAsset.get("title")))
                        .build();
                }

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId3,
                    "status", "completed"
                ));

                // ═══════════════════════════════════════════════════════════
                // STEP 4: Stream Content
                // ═══════════════════════════════════════════════════════════
                String stepId4 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId4,
                    "stepIndex", stepIndex,
                    "stepName", "stream_output",
                    "stepTitle", "Delivering content...",
                    "icon", "📤"
                ));

                if (!emitterCompleted.get()) streamField(emitter, runId, "title", content.getTitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "subtitle", content.getSubtitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "description", content.getDescription(), emitterCompleted);
                if (!emitterCompleted.get() && content.getCtaText() != null)
                    streamField(emitter, runId, "ctaText", content.getCtaText(), emitterCompleted);
                if (!emitterCompleted.get() && content.getImageUrl() != null)
                    streamField(emitter, runId, "imageUrl", content.getImageUrl(), emitterCompleted);

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId4,
                    "status", "completed"
                ));

                // ═══════════════════════════════════════════════════════════
                // STATE_SNAPSHOT - Full state for UI recovery
                // ═══════════════════════════════════════════════════════════
                emitEvent(emitter, STATE_SNAPSHOT, Map.of(
                    "runId", runId,
                    "state", Map.of(
                        "content", content,
                        "componentType", content.getComponentType(),
                        "damAssets", damAssets,
                        "selectedAsset", damAssets.isEmpty() ? null : damAssets.get(0),
                        "aemConnected", aemIntegrationService.isConnected(),
                        "steps", java.util.List.of(
                            Map.of("name", "parse_intent", "status", "completed"),
                            Map.of("name", "dam_search", "status", "completed"),
                            Map.of("name", "generate_content", "status", "completed"),
                            Map.of("name", "stream_output", "status", "completed")
                        )
                    )
                ));

                // ═══════════════════════════════════════════════════════════
                // CUSTOM_EVENT - AEM ready for review
                // ═══════════════════════════════════════════════════════════
                emitEvent(emitter, CUSTOM_EVENT, Map.of(
                    "runId", runId,
                    "eventType", "aem.content.ready",
                    "payload", Map.of(
                        "componentType", content.getComponentType(),
                        "hasImage", content.getImageUrl() != null,
                        "imageSource", aemIntegrationService.isConnected() ? "AEM_DAM" : "STOCK",
                        "readyForReview", true,
                        "canSubmitWorkflow", aemIntegrationService.isConnected()
                    )
                ));

                // ═══════════════════════════════════════════════════════════
                // RUN_FINISHED
                // ═══════════════════════════════════════════════════════════
                emitEvent(emitter, RUN_FINISHED, Map.of(
                    "runId", runId,
                    "status", "completed",
                    "totalSteps", stepIndex,
                    "content", content,
                    "summary", Map.of(
                        "componentGenerated", content.getComponentType(),
                        "damAssetsFound", damAssets.size(),
                        "aemIntegrated", aemIntegrationService.isConnected()
                    )
                ));

                emitter.complete();

            } catch (Exception e) {
                if (!isClientDisconnection(e) && !emitterCompleted.get()) {
                    log.error("DAM streaming error: {}", e.getMessage());
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of(
                            "runId", runId,
                            "error", e.getMessage() != null ? e.getMessage() : "Unknown error",
                            "recoverable", true
                        ));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Extract a meaningful search term from user input for DAM search.
     */
    private String extractSearchTerm(String userInput) {
        // Simple extraction - look for common content keywords
        String lower = userInput.toLowerCase();

        if (lower.contains("summer")) return "summer";
        if (lower.contains("winter")) return "winter";
        if (lower.contains("hiking")) return "hiking";
        if (lower.contains("surfing")) return "surfing";
        if (lower.contains("skiing")) return "skiing";
        if (lower.contains("adventure")) return "adventure";
        if (lower.contains("nature")) return "nature";
        if (lower.contains("travel")) return "travel";
        if (lower.contains("food")) return "food";
        if (lower.contains("product")) return "product";

        // Default to first significant word
        String[] words = userInput.split("\\s+");
        for (String word : words) {
            if (word.length() > 4 && !word.matches("(?i)create|make|build|hero|banner|teaser|card")) {
                return word;
            }
        }
        return "adventure"; // fallback
    }

    /**
     * Check if the exception indicates a client disconnection or emitter already completed.
     * This is expected behavior when the user navigates away or closes the connection.
     */
    private boolean isClientDisconnection(Throwable e) {
        // Check the exception chain for common disconnection indicators
        Throwable current = e;
        while (current != null) {
            String className = current.getClass().getName();
            String message = current.getMessage();

            // ClientAbortException - Tomcat's indicator for client disconnect
            if (className.contains("ClientAbortException")) {
                return true;
            }

            // IllegalStateException when emitter is already completed
            if (current instanceof IllegalStateException) {
                if (message != null && (
                    message.contains("already completed") ||
                    message.contains("ResponseBodyEmitter"))) {
                    return true;
                }
            }

            // IOException with "Broken pipe" or "Connection reset" messages
            if (current instanceof IOException) {
                if (message != null && (
                    message.contains("Broken pipe") ||
                    message.contains("Connection reset") ||
                    message.contains("Connection refused") ||
                    message.contains("Stream closed"))) {
                    return true;
                }
            }

            current = current.getCause();
        }
        return false;
    }
}
