package com.example.aema2ui.controller;

import com.example.aema2ui.model.*;
import com.example.aema2ui.service.TelemetryService;
import com.example.aema2ui.service.WorkflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing AEM workflow operations.
 */
@RestController
@RequestMapping("/workflows")
public class WorkflowController {

    private final WorkflowService workflowService;
    private final TelemetryService telemetryService;

    public WorkflowController(WorkflowService workflowService, TelemetryService telemetryService) {
        this.workflowService = workflowService;
        this.telemetryService = telemetryService;
    }

    /**
     * Get all available workflow models.
     * GET /workflows/models
     */
    @GetMapping("/models")
    public ResponseEntity<List<WorkflowModel>> getAvailableWorkflows() {
        return ResponseEntity.ok(workflowService.getAvailableWorkflows());
    }

    /**
     * Get a specific workflow model.
     * GET /workflows/models/{id}
     */
    @GetMapping("/models/{id}")
    public ResponseEntity<WorkflowModel> getWorkflowModel(@PathVariable String id) {
        return workflowService.getWorkflowModel(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Submit content to a workflow.
     * POST /workflows/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<WorkflowInstance> submitToWorkflow(@RequestBody SubmitWorkflowRequest request) {
        WorkflowInstance instance = workflowService.submitToWorkflow(
                request.getContentId(),
                request.getContentPath(),
                request.getWorkflowModelId(),
                request.getInitiatedBy(),
                request.getMetadata()
        );
        telemetryService.record("workflow.submit", Map.of(
            "contentId", request.getContentId(),
            "workflowModelId", request.getWorkflowModelId()
        ));
        return ResponseEntity.ok(instance);
    }

    /**
     * Get workflow instance by ID.
     * GET /workflows/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkflowInstance> getWorkflow(@PathVariable String id) {
        return workflowService.getWorkflowInstance(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get workflow status.
     * GET /workflows/{id}/status
     */
    @GetMapping("/{id}/status")
    public ResponseEntity<WorkflowStatusResponse> getWorkflowStatus(@PathVariable String id) {
        return workflowService.getWorkflowInstance(id)
                .map(instance -> ResponseEntity.ok(new WorkflowStatusResponse(
                        instance.getId(),
                        instance.getStatus(),
                        instance.getCurrentStep(),
                        instance.getCurrentStepIndex(),
                        instance.getSteps().size(),
                        instance.getStartedAt() != null ? instance.getStartedAt().toString() : null,
                        instance.getCompletedAt() != null ? instance.getCompletedAt().toString() : null
                )))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all workflows.
     * GET /workflows
     */
    @GetMapping
    public ResponseEntity<List<WorkflowInstance>> getAllWorkflows(
            @RequestParam(required = false) String contentId) {
        List<WorkflowInstance> workflows;
        if (contentId != null && !contentId.isEmpty()) {
            workflows = workflowService.getWorkflowsByContentId(contentId);
        } else {
            workflows = workflowService.getAllWorkflows();
        }
        return ResponseEntity.ok(workflows);
    }

    /**
     * Advance workflow to next step.
     * POST /workflows/{id}/advance
     */
    @PostMapping("/{id}/advance")
    public ResponseEntity<WorkflowInstance> advanceWorkflow(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> request) {
        String comment = request != null ? request.get("comment") : null;
        WorkflowInstance instance = workflowService.advanceWorkflow(id, comment);
        telemetryService.record("workflow.advance", Map.of("workflowId", id));
        return ResponseEntity.ok(instance);
    }

    /**
     * Cancel a workflow.
     * DELETE /workflows/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<WorkflowInstance> cancelWorkflow(
            @PathVariable String id,
            @RequestParam(defaultValue = "Cancelled by user") String reason) {
        WorkflowInstance instance = workflowService.cancelWorkflow(id, reason);
        telemetryService.record("workflow.cancel", Map.of("workflowId", id));
        return ResponseEntity.ok(instance);
    }

    /**
     * Suspend a workflow.
     * POST /workflows/{id}/suspend
     */
    @PostMapping("/{id}/suspend")
    public ResponseEntity<WorkflowInstance> suspendWorkflow(@PathVariable String id) {
        WorkflowInstance instance = workflowService.suspendWorkflow(id);
        return ResponseEntity.ok(instance);
    }

    /**
     * Resume a suspended workflow.
     * POST /workflows/{id}/resume
     */
    @PostMapping("/{id}/resume")
    public ResponseEntity<WorkflowInstance> resumeWorkflow(@PathVariable String id) {
        WorkflowInstance instance = workflowService.resumeWorkflow(id);
        return ResponseEntity.ok(instance);
    }

    // Request/Response DTOs

    @lombok.Data
    public static class SubmitWorkflowRequest {
        private String contentId;
        private String contentPath;
        private String workflowModelId;
        private String initiatedBy;
        private Map<String, Object> metadata;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class WorkflowStatusResponse {
        private String id;
        private WorkflowStatus status;
        private String currentStep;
        private int currentStepIndex;
        private int totalSteps;
        private String startedAt;
        private String completedAt;
    }
}
