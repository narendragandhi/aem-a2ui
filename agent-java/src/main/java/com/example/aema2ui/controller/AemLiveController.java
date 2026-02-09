package com.example.aema2ui.controller;

import com.example.aema2ui.service.AemLiveConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aem")
@RequiredArgsConstructor
public class AemLiveController {

    private final AemLiveConnectionService aemLiveService;

    @GetMapping("/health")
    public ResponseEntity<AemLiveConnectionService.AemHealthStatus> getHealth() {
        return ResponseEntity.ok(aemLiveService.checkConnection());
    }

    @GetMapping("/pages/{path:.*}")
    public ResponseEntity<AemLiveConnectionService.AemPageInfo> getPageInfo(@PathVariable String path) {
        return ResponseEntity.ok(aemLiveService.getPageInfo("/" + path));
    }

    @PostMapping("/pages/{path:.*}/push")
    public ResponseEntity<Map<String, Object>> pushContent(
            @PathVariable String path,
            @RequestBody Map<String, Object> content) {
        boolean success = aemLiveService.pushContent("/" + path, content);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "path", "/" + path,
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<AemLiveConnectionService.AemTemplate>> getTemplates() {
        return ResponseEntity.ok(aemLiveService.getTemplates());
    }

    @GetMapping("/workflows")
    public ResponseEntity<List<AemLiveConnectionService.AemWorkflowModel>> getWorkflowModels() {
        return ResponseEntity.ok(aemLiveService.getWorkflowModels());
    }
}
