package com.example.aema2ui.controller;

import com.example.aema2ui.service.aem.AemContentFragmentClient;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API for AEM Content Fragment GraphQL operations.
 */
@Slf4j
@RestController
@RequestMapping("/graphql")
@RequiredArgsConstructor
public class AemGraphQLController {

    private final AemContentFragmentClient cfClient;

    /**
     * Execute raw GraphQL query
     */
    @PostMapping("/query")
    public JsonNode executeQuery(@RequestBody Map<String, String> request) {
        String query = request.get("query");
        return cfClient.executeQuery(query);
    }

    /**
     * Execute persisted query
     */
    @GetMapping("/persisted/{name}")
    public JsonNode executePersistedQuery(@PathVariable String name) {
        return cfClient.executePersistedQuery(name);
    }

    /**
     * List Content Fragment Models
     */
    @GetMapping("/models")
    public List<Map<String, String>> listModels() {
        return cfClient.listContentFragmentModels();
    }

    /**
     * Query Content Fragments by model
     */
    @GetMapping("/fragments/{model}")
    public List<Map<String, Object>> queryFragments(
            @PathVariable String model,
            @RequestParam(defaultValue = "10") int limit) {
        return cfClient.queryContentFragments(model, limit);
    }

    /**
     * Get single Content Fragment
     */
    @GetMapping("/fragment")
    public ResponseEntity<Map<String, Object>> getFragment(@RequestParam String path) {
        Map<String, Object> fragment = cfClient.getContentFragment(path);
        if (fragment != null) {
            return ResponseEntity.ok(fragment);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Create Content Fragment
     */
    @PostMapping("/fragments")
    public ResponseEntity<Map<String, Object>> createFragment(@RequestBody Map<String, Object> request) {
        try {
            String parentPath = (String) request.getOrDefault("parentPath", "/content/dam/aem-demo");
            String name = (String) request.get("name");
            String modelPath = (String) request.get("modelPath");
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) request.get("data");

            String path = cfClient.createContentFragment(parentPath, name, modelPath, data);
            return ResponseEntity.ok(Map.of("path", path, "status", "created"));
        } catch (Exception e) {
            log.error("Failed to create Content Fragment", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update Content Fragment
     */
    @PutMapping("/fragments")
    public ResponseEntity<Map<String, Object>> updateFragment(@RequestBody Map<String, Object> request) {
        try {
            String path = (String) request.get("path");
            @SuppressWarnings("unchecked")
            Map<String, Object> data = (Map<String, Object>) request.get("data");

            cfClient.updateContentFragment(path, data);
            return ResponseEntity.ok(Map.of("path", path, "status", "updated"));
        } catch (Exception e) {
            log.error("Failed to update Content Fragment", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete Content Fragment
     */
    @DeleteMapping("/fragments")
    public ResponseEntity<Void> deleteFragment(@RequestParam String path) {
        try {
            cfClient.deleteContentFragment(path);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete Content Fragment", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
