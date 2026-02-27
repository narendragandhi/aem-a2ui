package com.example.aema2ui.controller;

import com.example.aema2ui.service.AemIntegrationService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Webhook handler for AEM events.
 * Receives events from AEM via Adobe I/O Events or direct webhook.
 */
@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class AemWebhookController {

    private final AemIntegrationService integrationService;

    /**
     * Health check endpoint for webhook registration
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> webhookInfo() {
        return ResponseEntity.ok(Map.of(
            "status", "active",
            "endpoints", "/webhooks/aem, /webhooks/adobe-io",
            "description", "AEM event webhook handler"
        ));
    }

    /**
     * Handle AEM page events (via Sling webhook or custom endpoint)
     */
    @PostMapping("/aem")
    public ResponseEntity<Map<String, Object>> handleAemEvent(@RequestBody JsonNode payload) {
        try {
            String eventType = payload.has("eventType") ? payload.get("eventType").asText() : "unknown";
            String path = payload.has("path") ? payload.get("path").asText() : "";
            String user = payload.has("user") ? payload.get("user").asText() : "system";

            log.info("Received AEM event: type={}, path={}, user={}", eventType, path, user);

            switch (eventType) {
                case "PAGE_CREATED":
                    integrationService.onPageCreated(path, user);
                    break;
                case "PAGE_MODIFIED":
                    integrationService.onPageModified(path, user);
                    break;
                case "PAGE_DELETED":
                    integrationService.onPageDeleted(path, user);
                    break;
                case "PAGE_PUBLISHED":
                    integrationService.onPagePublished(path, user);
                    break;
                case "PAGE_UNPUBLISHED":
                    integrationService.onPageUnpublished(path, user);
                    break;
                case "ASSET_CREATED":
                    integrationService.onAssetCreated(path, user);
                    break;
                case "ASSET_UPDATED":
                    integrationService.onAssetUpdated(path, user);
                    break;
                case "ASSET_DELETED":
                    integrationService.onAssetDeleted(path, user);
                    break;
                case "WORKFLOW_STARTED":
                    integrationService.onWorkflowStarted(path, user);
                    break;
                case "WORKFLOW_COMPLETED":
                    integrationService.onWorkflowCompleted(path, user);
                    break;
                default:
                    log.debug("Unhandled event type: {}", eventType);
            }

            return ResponseEntity.ok(Map.of(
                "status", "received",
                "eventType", eventType,
                "path", path
            ));

        } catch (Exception e) {
            log.error("Failed to process AEM webhook: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Handle Adobe I/O Events (Adobe Experience Cloud events)
     */
    @PostMapping("/adobe-io")
    public ResponseEntity<Map<String, Object>> handleAdobeIOEvent(@RequestBody JsonNode payload) {
        try {
            String eventCode = payload.has("event_code") ? payload.get("event_code").asText() : 
                              payload.has("eventCode") ? payload.get("eventCode").asText() : "unknown";
            
            log.info("Received Adobe I/O event: code={}", eventCode);

            // Handle common Adobe I/O event types
            if (payload.has("data")) {
                JsonNode data = payload.get("data");
                String resourcePath = data.has("path") ? data.get("path").asText() : "";
                String action = data.has("type") ? data.get("type").asText() : "";

                switch (action) {
                    case "publish":
                    case "published":
                        integrationService.onPagePublished(resourcePath, "adobe-io");
                        break;
                    case "unpublish":
                        integrationService.onPageUnpublished(resourcePath, "adobe-io");
                        break;
                    case "delete":
                        integrationService.onPageDeleted(resourcePath, "adobe-io");
                        break;
                }
            }

            return ResponseEntity.ok(Map.of("status", "received"));

        } catch (Exception e) {
            log.error("Failed to process Adobe I/O webhook: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Handle workflow step events
     */
    @PostMapping("/workflow")
    public ResponseEntity<Map<String, Object>> handleWorkflowEvent(@RequestBody JsonNode payload) {
        try {
            String workflowModel = payload.has("workflowModel") ? payload.get("workflowModel").asText() : "";
            String stepName = payload.has("stepName") ? payload.get("stepName").asText() : "";
            String status = payload.has("status") ? payload.get("status").asText() : "";
            String payloadPath = payload.has("payload") ? payload.get("payload").asText() : "";

            log.info("Workflow event: model={}, step={}, status={}", workflowModel, stepName, status);

            integrationService.onWorkflowStep(workflowModel, stepName, status, payloadPath);

            return ResponseEntity.ok(Map.of(
                "status", "received",
                "workflowModel", workflowModel,
                "stepName", stepName
            ));

        } catch (Exception e) {
            log.error("Failed to process workflow webhook: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }
}
