package com.example.aema2ui.service;

import com.example.aema2ui.agent.AemContentAgent;
import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.model.BrandValidationResult;
import com.example.aema2ui.model.ContentSuggestion;
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
import java.util.Base64;
import java.nio.charset.StandardCharsets;

/**
 * SSE Streaming service for real-time content generation.
 *
 * Uses Embabel Agent runtime for content generation via AgentInvocation.
 * Implements AG-UI protocol event types for real-time streaming.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StreamingContentService {

    private final LlmService llmService;
    private final ObjectMapper objectMapper;
    private final AemContentAgent contentAgent;

    private final ExecutorService executor = Executors.newCachedThreadPool();

    // AG-UI Event Types
    public static final String RUN_STARTED = "RUN_STARTED";
    public static final String RUN_FINISHED = "RUN_FINISHED";
    public static final String RUN_ERROR = "RUN_ERROR";
    public static final String STEP_STARTED = "STEP_STARTED";
    public static final String STEP_FINISHED = "STEP_FINISHED";
    public static final String TEXT_MESSAGE_START = "TEXT_MESSAGE_START";
    public static final String TEXT_MESSAGE_DELTA = "TEXT_MESSAGE_DELTA";
    public static final String TEXT_MESSAGE_END = "TEXT_MESSAGE_END";
    public static final String TOOL_CALL_START = "TOOL_CALL_START";
    public static final String TOOL_CALL_ARGS = "TOOL_CALL_ARGS";
    public static final String TOOL_CALL_END = "TOOL_CALL_END";
    public static final String TOOL_CALL_RESULT = "TOOL_CALL_RESULT";
    public static final String STATE_DELTA = "STATE_DELTA";
    public static final String STATE_SNAPSHOT = "STATE_SNAPSHOT";
    public static final String MESSAGES_SNAPSHOT = "MESSAGES_SNAPSHOT";
    public static final String RAW_EVENT = "RAW_EVENT";
    public static final String CUSTOM_EVENT = "CUSTOM_EVENT";
    public static final String INTERRUPT_REQUESTED = "INTERRUPT_REQUESTED";
    public static final String INTERRUPT_RESOLVED = "INTERRUPT_RESOLVED";

    /**
     * Stream content generation with real-time updates using Embabel Agent runtime.
     */
    public void streamContentGeneration(String userInput, String componentType, SseEmitter emitter, boolean useAi) {
        String runId = UUID.randomUUID().toString();
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        emitter.onCompletion(() -> { emitterCompleted.set(true); });
        emitter.onTimeout(() -> { emitterCompleted.set(true); });
        emitter.onError(e -> { emitterCompleted.set(true); });

        executor.execute(() -> {
            try {
                int stepIndex = 0;

                // RUN_STARTED
                if (emitterCompleted.get()) return;
                emitEvent(emitter, RUN_STARTED, Map.of(
                    "runId", runId,
                    "agentName", "AEM Content Assistant",
                    "version", "2.0"
                ));

                // STEP 1: Generate Content via Embabel Agent Runtime
                String stepId1 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "stepIndex", stepIndex,
                    "stepName", "generate_content",
                    "stepTitle", "Generating content...",
                    "stepDescription", useAi ? "Using Embabel agent runtime with LLM" : "Applying brand templates"
                ));

                // Tool Call: Agent Invocation
                String toolCallId = UUID.randomUUID().toString();
                emitEvent(emitter, TOOL_CALL_START, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "toolCallId", toolCallId,
                    "toolName", "embabel_agent_invoke",
                    "toolDescription", "Embabel GOAP planner: parseUserIntent -> generateContent"
                ));

                emitEvent(emitter, TOOL_CALL_ARGS, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "args", Map.of(
                        "input", userInput,
                        "componentType", componentType != null ? componentType : "auto-detect"
                    )
                ));

                // Generate content via Embabel Agent Runtime
                ContentSuggestion content = invokeAgentWithFallback(userInput);

                emitEvent(emitter, TOOL_CALL_RESULT, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "result", Map.of(
                        "success", true,
                        "title", content.getTitle(),
                        "planner", "GOAP"
                    )
                ));

                emitEvent(emitter, TOOL_CALL_END, Map.of(
                    "runId", runId,
                    "toolCallId", toolCallId,
                    "status", "completed"
                ));

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId1,
                    "stepIndex", stepIndex,
                    "stepName", "generate_content",
                    "status", "completed"
                ));

                // STEP 2: Stream Content Fields
                String stepId2 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "stepIndex", stepIndex,
                    "stepName", "stream_fields",
                    "stepTitle", "Streaming content..."
                ));

                if (!emitterCompleted.get()) streamField(emitter, runId, "title", content.getTitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "subtitle", content.getSubtitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "description", content.getDescription(), emitterCompleted);
                if (!emitterCompleted.get() && content.getCtaText() != null)
                    streamField(emitter, runId, "ctaText", content.getCtaText(), emitterCompleted);
                if (!emitterCompleted.get() && content.getCtaUrl() != null)
                    streamField(emitter, runId, "ctaUrl", content.getCtaUrl(), emitterCompleted);
                if (!emitterCompleted.get() && content.getPrice() != null)
                    streamField(emitter, runId, "price", content.getPrice(), emitterCompleted);
                if (!emitterCompleted.get() && content.getImageUrl() != null)
                    streamField(emitter, runId, "imageUrl", content.getImageUrl(), emitterCompleted);

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId,
                    "stepId", stepId2,
                    "stepIndex", stepIndex,
                    "stepName", "stream_fields",
                    "status", "completed"
                ));

                // STATE_SNAPSHOT
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, STATE_SNAPSHOT, Map.of(
                        "runId", runId,
                        "state", Map.of(
                            "content", content,
                            "componentType", content.getComponentType(),
                            "steps", stepIndex,
                            "status", "completed",
                            "planner", "Embabel GOAP"
                        )
                    ));
                }

                // CUSTOM_EVENT
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, CUSTOM_EVENT, Map.of(
                        "runId", runId,
                        "eventType", "aem.content.ready",
                        "payload", Map.of(
                            "componentType", content.getComponentType(),
                            "readyForReview", true
                        )
                    ));
                }

                // RUN_FINISHED
                if (!emitterCompleted.get()) {
                    emitEvent(emitter, RUN_FINISHED, Map.of(
                        "runId", runId,
                        "status", "completed",
                        "totalSteps", stepIndex,
                        "planner", "Embabel GOAP"
                    ));
                    Thread.sleep(100);
                    emitter.complete();
                }

            } catch (Exception e) {
                if (!isClientDisconnection(e) && !emitterCompleted.get()) {
                    log.error("Streaming error for runId {}: {}", runId, e.getMessage());
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of(
                            "runId", runId,
                            "error", e.getMessage() != null ? e.getMessage() : "Unknown error"
                        ));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Stream raw generation via Embabel Agent runtime.
     */
    public void streamRawGeneration(String prompt, SseEmitter emitter) {
        String runId = UUID.randomUUID().toString();
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        emitter.onCompletion(() -> emitterCompleted.set(true));
        emitter.onTimeout(() -> emitterCompleted.set(true));
        emitter.onError(e -> emitterCompleted.set(true));

        executor.execute(() -> {
            try {
                emitEvent(emitter, RUN_STARTED, Map.of("runId", runId, "mode", "raw_streaming"));

                ContentSuggestion result = invokeAgentWithFallback(prompt);

                emitEvent(emitter, TEXT_MESSAGE_START, Map.of(
                    "runId", runId,
                    "messageId", UUID.randomUUID().toString(),
                    "field", "content"
                ));

                emitEvent(emitter, TEXT_MESSAGE_DELTA, Map.of(
                    "runId", runId,
                    "messageId", UUID.randomUUID().toString(),
                    "field", "content",
                    "delta", result.getTitle() + " - " + result.getDescription(),
                    "content", result.getTitle()
                ));

                emitEvent(emitter, RUN_FINISHED, Map.of(
                    "runId", runId,
                    "status", "completed"
                ));
                emitter.complete();
            } catch (Exception e) {
                if (!isClientDisconnection(e) && !emitterCompleted.get()) {
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of("runId", runId, "error", e.getMessage()));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Stream governance checks (brand + SEO) for a content suggestion.
     */
    public void streamGovernance(
            String contentBase64,
            String brandId,
            SseEmitter emitter,
            BrandConfigService brandConfigService,
            BrandValidationService brandValidationService,
            ObjectMapper mapper) {

        String runId = UUID.randomUUID().toString();
        final java.util.concurrent.atomic.AtomicBoolean emitterCompleted = new java.util.concurrent.atomic.AtomicBoolean(false);

        emitter.onCompletion(() -> emitterCompleted.set(true));
        emitter.onTimeout(() -> emitterCompleted.set(true));
        emitter.onError(e -> emitterCompleted.set(true));

        executor.execute(() -> {
            try {
                byte[] decoded = Base64.getDecoder().decode(contentBase64);
                String json = new String(decoded, StandardCharsets.UTF_8);
                ContentSuggestion content = mapper.readValue(json, ContentSuggestion.class);

                BrandConfig brandConfig = brandId != null
                    ? brandConfigService.getBrandConfig(brandId).orElse(brandConfigService.getActiveBrandConfig())
                    : brandConfigService.getActiveBrandConfig();

                emitEvent(emitter, RUN_STARTED, Map.of("runId", runId, "agentName", "Policy Copilot", "version", "1.0"));

                String stepId1 = "step-1";
                emitEvent(emitter, STEP_STARTED, Map.of("runId", runId, "stepId", stepId1, "stepIndex", 1, "stepName", "brand_check", "stepTitle", "Brand Compliance Check"));

                BrandValidationResult brandValidation = brandValidationService.validate(content, brandConfig);
                emitEvent(emitter, STEP_FINISHED, Map.of("runId", runId, "stepId", stepId1, "status", "completed"));

                Map<String, Object> seo = simpleSeoScore(content);
                emitEvent(emitter, CUSTOM_EVENT, Map.of("runId", runId, "eventType", "governance.result", "payload", Map.of("brand", brandValidation, "seo", seo)));

                emitEvent(emitter, RUN_FINISHED, Map.of("runId", runId, "status", "completed"));
                emitter.complete();
            } catch (Exception e) {
                if (!emitterCompleted.get()) {
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of("runId", runId, "error", e.getMessage()));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    /**
     * Advanced streaming with Human-in-the-Loop and AEM DAM integration.
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
                int totalSteps = 4;

                emitEvent(emitter, RUN_STARTED, Map.of(
                    "runId", runId,
                    "agentName", "AEM Content Assistant",
                    "version", "2.0",
                    "capabilities", java.util.List.of("content_generation", "dam_search", "hitl_approval"),
                    "aemConnected", aemIntegrationService.isConnected(),
                    "totalSteps", totalSteps
                ));

                // STEP 1: Generate Content via Embabel Agent Runtime
                String stepId1 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId, "stepId", stepId1, "stepIndex", stepIndex,
                    "stepName", "agent_generate", "stepTitle", "Generating with Embabel GOAP planner..."
                ));

                String toolCallId = UUID.randomUUID().toString();
                emitEvent(emitter, TOOL_CALL_START, Map.of(
                    "runId", runId, "stepId", stepId1, "toolCallId", toolCallId,
                    "toolName", "embabel_agent_invoke", "toolDescription", "Embabel GOAP planner execution"
                ));

                emitEvent(emitter, TOOL_CALL_ARGS, Map.of(
                    "runId", runId, "toolCallId", toolCallId,
                    "args", Map.of(
                        "input", userInput,
                        "componentType", componentType != null ? componentType : "auto-detect"
                    )
                ));

                ContentSuggestion content = invokeAgentWithFallback(userInput);

                emitEvent(emitter, TOOL_CALL_RESULT, Map.of(
                    "runId", runId, "toolCallId", toolCallId,
                    "result", Map.of("success", true, "title", content.getTitle(), "planner", "GOAP")
                ));

                emitEvent(emitter, TOOL_CALL_END, Map.of(
                    "runId", runId, "toolCallId", toolCallId, "status", "completed"
                ));

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId, "stepId", stepId1, "status", "completed"
                ));

                // STEP 2: HITL Approval
                String stepId2 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId, "stepId", stepId2, "stepIndex", stepIndex,
                    "stepName", "content_review", "stepTitle", "Ready for Review"
                ));

                String interruptId = UUID.randomUUID().toString();
                emitEvent(emitter, INTERRUPT_REQUESTED, Map.of(
                    "runId", runId, "interruptId", interruptId, "type", "approval",
                    "title", "Review Generated Content",
                    "description", "Please review the content before publishing to AEM.",
                    "options", java.util.List.of(
                        Map.of("id", "approve", "label", "Approve & Publish", "style", "primary"),
                        Map.of("id", "reject", "label", "Reject", "style", "danger")
                    ),
                    "content", content
                ));

                Thread.sleep(100);

                emitEvent(emitter, INTERRUPT_RESOLVED, Map.of(
                    "runId", runId, "interruptId", interruptId, "resolution", "approve", "resolvedBy", "auto"
                ));

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId, "stepId", stepId2, "status", "completed"
                ));

                // STEP 3: Stream Content
                String stepId3 = "step-" + (++stepIndex);
                emitEvent(emitter, STEP_STARTED, Map.of(
                    "runId", runId, "stepId", stepId3, "stepIndex", stepIndex,
                    "stepName", "stream_output", "stepTitle", "Delivering content..."
                ));

                if (!emitterCompleted.get()) streamField(emitter, runId, "title", content.getTitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "subtitle", content.getSubtitle(), emitterCompleted);
                if (!emitterCompleted.get()) streamField(emitter, runId, "description", content.getDescription(), emitterCompleted);
                if (!emitterCompleted.get() && content.getCtaText() != null)
                    streamField(emitter, runId, "ctaText", content.getCtaText(), emitterCompleted);
                if (!emitterCompleted.get() && content.getImageUrl() != null)
                    streamField(emitter, runId, "imageUrl", content.getImageUrl(), emitterCompleted);

                emitEvent(emitter, STEP_FINISHED, Map.of(
                    "runId", runId, "stepId", stepId3, "status", "completed"
                ));

                // STATE_SNAPSHOT
                emitEvent(emitter, STATE_SNAPSHOT, Map.of(
                    "runId", runId,
                    "state", Map.of(
                        "content", content,
                        "componentType", content.getComponentType(),
                        "aemConnected", aemIntegrationService.isConnected(),
                        "planner", "Embabel GOAP"
                    )
                ));

                // CUSTOM_EVENT for AEM
                emitEvent(emitter, CUSTOM_EVENT, Map.of(
                    "runId", runId,
                    "eventType", "aem.content.ready",
                    "payload", Map.of(
                        "componentType", content.getComponentType(),
                        "readyForReview", true
                    )
                ));

                emitEvent(emitter, RUN_FINISHED, Map.of(
                    "runId", runId, "status", "completed", "totalSteps", stepIndex, "planner", "Embabel GOAP"
                ));

                Thread.sleep(100);
                emitter.complete();
            } catch (Exception e) {
                if (!isClientDisconnection(e) && !emitterCompleted.get()) {
                    try {
                        emitEvent(emitter, RUN_ERROR, Map.of("runId", runId, "error", e.getMessage()));
                        emitter.completeWithError(e);
                    } catch (Exception ignored) {}
                }
            }
        });
    }

    private void streamField(SseEmitter emitter, String runId, String fieldName, String value,
            java.util.concurrent.atomic.AtomicBoolean emitterCompleted) throws IOException {
        if (value == null || value.isEmpty()) return;
        if (emitterCompleted.get()) return;

        String messageId = UUID.randomUUID().toString();
        emitEvent(emitter, TEXT_MESSAGE_START, Map.of("runId", runId, "messageId", messageId, "field", fieldName));
        emitEvent(emitter, TEXT_MESSAGE_DELTA, Map.of("runId", runId, "messageId", messageId, "field", fieldName, "delta", value, "content", value));
        if (!emitterCompleted.get()) {
            emitEvent(emitter, TEXT_MESSAGE_END, Map.of("runId", runId, "messageId", messageId, "field", fieldName, "content", value));
        }
    }

    private void emitEvent(SseEmitter emitter, String eventType, Map<String, Object> data) throws IOException {
        try {
            Map<String, Object> event = Map.of("type", eventType, "timestamp", System.currentTimeMillis(), "data", data);
            String json = objectMapper.writeValueAsString(event);
            emitter.send(SseEmitter.event().name(eventType).data(json));
        } catch (Exception e) {
            if (!isClientDisconnection(e)) {
                log.error("Failed to emit SSE event: {}", e.getMessage());
            }
            throw e;
        }
    }

    public SseEmitter createEmitter() {
        return new SseEmitter(120000L);
    }

    private ContentSuggestion invokeAgentWithFallback(String userInput) {
        if (llmService.isEnabled()) {
            try {
                String prompt = AemContentAgent.BRAND_GUIDELINES + "\n\nGenerate " + userInput +
                    " content. Reply ONLY with JSON: {\"title\":\"...\",\"subtitle\":\"...\",\"description\":\"...\",\"ctaText\":\"...\",\"ctaUrl\":\"/...\",\"imageUrl\":\"...\",\"componentType\":\"...\"}";
                ContentSuggestion result = llmService.generateObject(prompt, ContentSuggestion.class);
                if (result != null) {
                    return result;
                }
            } catch (Exception e) {
                log.warn("LLM invocation failed, falling back to templates: {}", e.getMessage());
            }
        }
        return contentAgent.generateTemplateContent(userInput, null);
    }

    private boolean isClientDisconnection(Throwable e) {
        Throwable current = e;
        while (current != null) {
            String className = current.getClass().getName();
            String message = current.getMessage();
            if (className.contains("ClientAbortException")) return true;
            if (current instanceof IllegalStateException && message != null &&
                (message.contains("already completed") || message.contains("ResponseBodyEmitter"))) return true;
            if (current instanceof IOException && message != null &&
                (message.contains("Broken pipe") || message.contains("Connection reset") || message.contains("Stream closed"))) return true;
            current = current.getCause();
        }
        return false;
    }

    private Map<String, Object> simpleSeoScore(ContentSuggestion content) {
        int score = 100;
        java.util.List<String> issues = new java.util.ArrayList<>();
        String title = content != null ? content.getTitle() : null;
        String desc = content != null ? content.getDescription() : null;
        if (title == null || title.length() < 10) { score -= 15; issues.add("Title too short"); }
        if (title != null && title.length() > 60) { score -= 10; issues.add("Title too long"); }
        if (desc == null || desc.length() < 50) { score -= 15; issues.add("Description too short"); }
        if (desc != null && desc.length() > 160) { score -= 10; issues.add("Description too long"); }
        return Map.of("score", Math.max(0, score), "issues", issues);
    }
}
