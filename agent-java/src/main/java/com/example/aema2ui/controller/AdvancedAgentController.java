package com.example.aema2ui.controller;

import com.example.aema2ui.model.TaskRequest;
import com.example.aema2ui.model.TaskResponse;
import com.example.aema2ui.service.AdvancedA2UIService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/advanced")
@ConditionalOnProperty(name = "aem.demo.enabled", havingValue = "true", matchIfMissing = true)
public class AdvancedAgentController {

    private final AdvancedA2UIService advancedService;

    /**
     * Root endpoint with available demos.
     */
    @GetMapping("")
    public Map<String, Object> root() {
        return Map.of(
            "status", "ok",
            "name", "Advanced AEM A2UI Agent (Java)",
            "version", "2.0.0",
            "demos", advancedService.getAvailableDemos()
        );
    }

    /**
     * A2A Agent Card.
     */
    @GetMapping("/.well-known/agent-card.json")
    public Map<String, Object> agentCard() {
        return Map.of(
            "name", "Advanced AEM Content Assistant (Java)",
            "description", "Advanced A2UI demos for AEM authoring",
            "url", "http://localhost:10003/advanced",
            "version", "2.0.0",
            "capabilities", Map.of("a2ui", Map.of("version", "0.8"))
        );
    }

    /**
     * Handle task requests - selects demo based on input.
     */
    @PostMapping("/tasks")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        String userText = extractUserText(request);
        List<Map<String, Object>> messages = advancedService.selectDemo(userText);

        return ResponseEntity.ok(TaskResponse.builder()
            .id(UUID.randomUUID().toString())
            .status("completed")
            .messages(messages)
            .build());
    }

    /**
     * Get specific demo by name.
     */
    @GetMapping("/demo/{demoName}")
    public ResponseEntity<TaskResponse> getDemo(@PathVariable String demoName) {
        List<Map<String, Object>> messages = switch (demoName) {
            case "list" -> advancedService.demoDynamicList();
            case "wizard" -> advancedService.demoWizard(1);
            case "wizard_2" -> advancedService.demoWizard(2);
            case "wizard_3" -> advancedService.demoWizard(3);
            case "tabs" -> advancedService.demoTabs();
            case "ai" -> advancedService.demoAIContentGenerator();
            case "collab" -> advancedService.demoCollaboration();
            default -> List.of(Map.of("error", "Unknown demo: " + demoName,
                "available", advancedService.getAvailableDemos().keySet()));
        };

        return ResponseEntity.ok(TaskResponse.builder()
            .id(UUID.randomUUID().toString())
            .status("completed")
            .messages(messages)
            .build());
    }

    /**
     * Handle user actions.
     */
    @PostMapping("/actions/{actionName}")
    public ResponseEntity<Map<String, Object>> handleAction(
            @PathVariable String actionName,
            @RequestBody(required = false) Map<String, Object> context) {

        return switch (actionName) {
            case "wizard_navigate" -> {
                int step = context != null && context.containsKey("step")
                    ? ((Number) context.get("step")).intValue()
                    : 1;
                yield ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", advancedService.demoWizard(step)
                ));
            }
            case "generate_content" -> ResponseEntity.ok(Map.of(
                "success", true,
                "messages", advancedService.demoAIContentGenerator()
            ));
            default -> ResponseEntity.ok(Map.of(
                "success", true,
                "action", actionName,
                "context", context != null ? context : Map.of()
            ));
        };
    }

    private String extractUserText(TaskRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().getParts() == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (TaskRequest.MessagePart part : request.getMessage().getParts()) {
            if (part.getText() != null) {
                sb.append(part.getText());
            }
        }
        return sb.toString();
    }
}
