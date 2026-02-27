package com.example.aema2ui.service;

import com.example.aema2ui.config.AemConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AemLiveConnectionService {

    private final AemConfig aemConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    private Instant lastHealthCheck;
    private boolean isConnected;
    private String connectionError;

    public AemHealthStatus checkConnection() {
        if (!aemConfig.isEnabled()) {
            return AemHealthStatus.builder()
                    .connected(false)
                    .message("AEM integration is disabled")
                    .build();
        }

        try {
            // Use a reliable endpoint that exists in AEM
            String healthUrl = aemConfig.getAuthorUrl() + "/libs/granite/core/content/login.html";
            HttpHeaders headers = createAuthHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    healthUrl, HttpMethod.GET, entity, String.class);

            isConnected = response.getStatusCode().is2xxSuccessful();
            lastHealthCheck = Instant.now();

            if (isConnected) {
                return AemHealthStatus.builder()
                        .connected(true)
                        .authorUrl(aemConfig.getAuthorUrl())
                        .message("Connected to AEM Author")
                        .build();
            } else {
                connectionError = "Health check returned: " + response.getStatusCode();
                return AemHealthStatus.builder()
                        .connected(false)
                        .message(connectionError)
                        .build();
            }
        } catch (Exception e) {
            isConnected = false;
            connectionError = e.getMessage();
            log.warn("AEM health check failed: {}", e.getMessage());
            return AemHealthStatus.builder()
                    .connected(false)
                    .message("Connection failed: " + e.getMessage())
                    .build();
        }
    }

    public AemPageInfo getPageInfo(String path) {
        if (!aemConfig.isEnabled() || !isConnected) {
            return createMockPageInfo(path);
        }

        try {
            String pageUrl = aemConfig.getAuthorUrl() + path + ".json";
            HttpHeaders headers = createAuthHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    pageUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode pageNode = objectMapper.readTree(response.getBody());
                return AemPageInfo.builder()
                        .path(path)
                        .title(pageNode.path("title").asText(path))
                        .template(pageNode.path("template").asText("unknown"))
                        .status("authored")
                        .lastModified(Instant.now())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Failed to get page info for {}: {}", path, e.getMessage());
        }

        return createMockPageInfo(path);
    }

    public boolean pushContent(String path, Map<String, Object> content) {
        if (!aemConfig.isEnabled() || !isConnected) {
            log.info("Mock push content to {}: {}", path, content);
            return true;
        }

        try {
            String saveUrl = aemConfig.getAuthorUrl() + path;
            HttpHeaders headers = createAuthHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(content, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    saveUrl, HttpMethod.POST, entity, String.class);

            boolean success = response.getStatusCode().is2xxSuccessful();
            log.info("Push content to {}: {}", path, success ? "success" : "failed");
            return success;
        } catch (Exception e) {
            log.error("Failed to push content to {}: {}", path, e.getMessage());
            return false;
        }
    }

    public List<AemTemplate> getTemplates() {
        if (!aemConfig.isEnabled() || !isConnected) {
            return getMockTemplates();
        }

        try {
            String templatesUrl = aemConfig.getAuthorUrl() + "/libs/cq/template/templates";
            HttpHeaders headers = createAuthHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    templatesUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                // Parse templates from response
                return getMockTemplates();
            }
        } catch (Exception e) {
            log.warn("Failed to get templates: {}", e.getMessage());
        }

        return getMockTemplates();
    }

    public List<AemWorkflowModel> getWorkflowModels() {
        if (!aemConfig.isEnabled() || !isConnected) {
            return getMockWorkflowModels();
        }

        try {
            String wfUrl = aemConfig.getAuthorUrl() + "/etc/workflow/models.json";
            HttpHeaders headers = createAuthHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    wfUrl, HttpMethod.GET, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return getMockWorkflowModels();
            }
        } catch (Exception e) {
            log.warn("Failed to get workflow models: {}", e.getMessage());
        }

        return getMockWorkflowModels();
    }

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (aemConfig.getUsername() != null) {
            headers.setBasicAuth(aemConfig.getUsername(), aemConfig.getPassword());
        }
        headers.set("User-Agent", "AEM-A2UI-Agent/1.0");
        return headers;
    }

    private AemPageInfo createMockPageInfo(String path) {
        return AemPageInfo.builder()
                .path(path)
                .title("Page " + path)
                .template("aem-demo/components/page")
                .status("mock")
                .lastModified(Instant.now())
                .build();
    }

    private List<AemTemplate> getMockTemplates() {
        return List.of(
                AemTemplate.builder().id("hero-page").name("Hero Page").path("/conf/aem-demo/templates/hero-page").build(),
                AemTemplate.builder().id("product-page").name("Product Page").path("/conf/aem-demo/templates/product-page").build(),
                AemTemplate.builder().id("landing-page").name("Landing Page").path("/conf/aem-demo/templates/landing-page").build()
        );
    }

    private List<AemWorkflowModel> getMockWorkflowModels() {
        return List.of(
                AemWorkflowModel.builder().id("publish").name("Publish").requiresApproval(true).build(),
                AemWorkflowModel.builder().id("review-approve").name("Review & Approve").requiresApproval(true).build(),
                AemWorkflowModel.builder().id("translation").name("Translation").requiresApproval(false).build()
        );
    }

    @lombok.Data
    @lombok.Builder
    public static class AemHealthStatus {
        private boolean connected;
        private String authorUrl;
        private String message;
    }

    @lombok.Data
    @lombok.Builder
    public static class AemPageInfo {
        private String path;
        private String title;
        private String template;
        private String status;
        private Instant lastModified;
    }

    @lombok.Data
    @lombok.Builder
    public static class AemTemplate {
        private String id;
        private String name;
        private String path;
    }

    @lombok.Data
    @lombok.Builder
    public static class AemWorkflowModel {
        private String id;
        private String name;
        private boolean requiresApproval;
    }
}
