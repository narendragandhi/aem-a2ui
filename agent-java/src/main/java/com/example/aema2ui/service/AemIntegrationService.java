package com.example.aema2ui.service;

import com.example.aema2ui.config.AemConfig;
import com.example.aema2ui.service.aem.AemHttpClient;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Service for integrating with AEM APIs.
 * This service provides methods to interact with AEM's content repository.
 *
 * Uses real AEM HTTP calls when connected, falls back to mock data when not.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AemIntegrationService {

    private final AemHttpClient aemHttpClient;
    private final AemConfig aemConfig;

    private final Map<String, Long> lastEventTimes = new ConcurrentHashMap<>();

    /**
     * Check if AEM is connected
     */
    public boolean isConnected() {
        return aemHttpClient.isConnected();
    }

    /**
     * Gets component properties from AEM.
     * Falls back to default structure if AEM is not connected.
     */
    public Map<String, Object> getComponentProperties(String componentPath) {
        if (!aemHttpClient.isConnected()) {
            log.debug("AEM not connected, returning default component properties");
            return getDefaultComponentProperties();
        }

        try {
            // Use Sling JSON export to get component properties
            String jsonPath = componentPath + ".json";
            Map<String, Object> properties = aemHttpClient.getAsMap(jsonPath);
            log.info("Retrieved component properties from AEM: {}", componentPath);
            return properties;
        } catch (Exception e) {
            log.warn("Failed to get component properties from AEM: {} - {}", componentPath, e.getMessage());
            return getDefaultComponentProperties();
        }
    }

    private Map<String, Object> getDefaultComponentProperties() {
        return new HashMap<>(Map.of(
            "resourceType", "core/wcm/components/teaser/v2/teaser",
            "jcr:title", "",
            "jcr:description", "",
            "fileReference", "",
            "linkURL", ""
        ));
    }

    /**
     * Updates component properties in AEM using Sling POST servlet.
     */
    public boolean updateComponentProperties(String componentPath, Map<String, Object> properties) {
        if (!aemHttpClient.isConnected()) {
            log.warn("AEM not connected, cannot update component: {}", componentPath);
            return false;
        }

        try {
            // Convert properties to form data for Sling POST servlet
            Map<String, String> formData = new HashMap<>();
            for (Map.Entry<String, Object> entry : properties.entrySet()) {
                if (entry.getValue() != null) {
                    formData.put(entry.getKey(), entry.getValue().toString());
                }
            }

            aemHttpClient.postForm(componentPath, formData);
            log.info("Updated component properties in AEM: {}", componentPath);
            return true;
        } catch (Exception e) {
            log.error("Failed to update component in AEM: {} - {}", componentPath, e.getMessage());
            return false;
        }
    }

    /**
     * Searches the DAM for assets using QueryBuilder.
     * Falls back to mock data if AEM is not connected.
     */
    public List<Map<String, Object>> searchDamAssets(String searchTerm, String mimeType) {
        if (!aemHttpClient.isConnected()) {
            log.debug("AEM not connected, returning mock DAM assets");
            return getMockDamAssets();
        }

        try {
            StringBuilder queryPath = new StringBuilder("/bin/querybuilder.json?");
            queryPath.append("path=").append(aemConfig.getDamRoot());
            queryPath.append("&type=dam:Asset");
            queryPath.append("&p.limit=50");

            if (searchTerm != null && !searchTerm.isEmpty()) {
                queryPath.append("&fulltext=").append(urlEncode(searchTerm));
            }

            if (mimeType != null && !mimeType.isEmpty()) {
                queryPath.append("&property=jcr:content/metadata/dc:format");
                queryPath.append("&property.operation=like");
                queryPath.append("&property.value=").append(urlEncode(mimeType)).append("%");
            }

            JsonNode response = aemHttpClient.get(queryPath.toString());
            List<Map<String, Object>> assets = new ArrayList<>();

            if (response.has("hits") && response.get("hits").isArray()) {
                for (JsonNode hit : response.get("hits")) {
                    String path = getTextValue(hit, "path", null);
                    String title = getTextValue(hit, "title", path != null ? path.substring(path.lastIndexOf('/') + 1) : "Unknown");

                    Map<String, Object> asset = new HashMap<>();
                    asset.put("path", path);
                    asset.put("title", title);
                    asset.put("mimeType", getTextValue(hit, "jcr:content/metadata/dc:format", "application/octet-stream"));
                    asset.put("thumbnailUrl", path != null ? aemHttpClient.getAuthorUrl() + path + "/_jcr_content/renditions/cq5dam.thumbnail.319.319.png" : null);
                    assets.add(asset);
                }
            }

            log.info("Found {} assets in AEM DAM matching: {}", assets.size(), searchTerm);
            return assets;
        } catch (Exception e) {
            log.warn("Failed to search DAM assets: {} - falling back to mock data", e.getMessage());
            return getMockDamAssets();
        }
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private List<Map<String, Object>> getMockDamAssets() {
        return List.of(
            Map.of(
                "path", "/content/dam/wknd/en/activities/hiking/hiking_702702299.jpg",
                "title", "Hiking Adventure",
                "mimeType", "image/jpeg"
            ),
            Map.of(
                "path", "/content/dam/wknd/en/activities/surfing/surfing_702702286.jpg",
                "title", "Surfing",
                "mimeType", "image/jpeg"
            ),
            Map.of(
                "path", "/content/dam/wknd/en/activities/skiing/skiing_702702288.jpg",
                "title", "Skiing",
                "mimeType", "image/jpeg"
            )
        );
    }

    /**
     * Gets page metadata from AEM.
     * Falls back to mock data if AEM is not connected.
     */
    public Map<String, Object> getPageMetadata(String pagePath) {
        if (!aemHttpClient.isConnected()) {
            log.debug("AEM not connected, returning mock page metadata");
            return getDefaultPageMetadata(pagePath);
        }

        try {
            // Get page properties via Sling JSON export
            String jsonPath = pagePath + "/jcr:content.json";
            Map<String, Object> properties = aemHttpClient.getAsMap(jsonPath);
            log.info("Retrieved page metadata from AEM: {}", pagePath);
            return properties;
        } catch (Exception e) {
            log.warn("Failed to get page metadata from AEM: {} - {}", pagePath, e.getMessage());
            return getDefaultPageMetadata(pagePath);
        }
    }

    private Map<String, Object> getDefaultPageMetadata(String pagePath) {
        String pageName = pagePath.substring(pagePath.lastIndexOf('/') + 1);
        return new HashMap<>(Map.of(
            "jcr:title", pageName,
            "jcr:description", "Page at " + pagePath,
            "cq:template", "/conf/wknd/settings/wcm/templates/page-content"
        ));
    }

    /**
     * Creates a new page in AEM.
     */
    public boolean createPage(String parentPath, String pageName, String title, String template) {
        if (!aemHttpClient.isConnected()) {
            log.warn("AEM not connected, cannot create page");
            return false;
        }

        try {
            Map<String, String> formData = new HashMap<>();
            formData.put("cmd", "createPage");
            formData.put("parentPath", parentPath);
            formData.put("title", title);
            formData.put("pageName", pageName);
            formData.put("template", template);

            aemHttpClient.postForm("/bin/wcmcommand", formData);
            log.info("Created page in AEM: {}/{}", parentPath, pageName);
            return true;
        } catch (Exception e) {
            log.error("Failed to create page in AEM: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Publishes a page in AEM.
     */
    public boolean publishPage(String pagePath) {
        if (!aemHttpClient.isConnected()) {
            log.warn("AEM not connected, cannot publish page");
            return false;
        }

        try {
            Map<String, String> formData = new HashMap<>();
            formData.put("cmd", "Activate");
            formData.put("path", pagePath);

            aemHttpClient.postForm("/bin/replicate.json", formData);
            log.info("Published page in AEM: {}", pagePath);
            return true;
        } catch (Exception e) {
            log.error("Failed to publish page in AEM: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Gets the list of available templates from AEM.
     */
    public List<Map<String, Object>> getAvailableTemplates(String sitePath) {
        if (!aemHttpClient.isConnected()) {
            log.debug("AEM not connected, returning default templates");
            return getDefaultTemplates();
        }

        try {
            // Query for templates under /conf
            String confPath = sitePath.replace("/content/", "/conf/");
            String queryPath = "/bin/querybuilder.json?path=" + confPath +
                "/settings/wcm/templates&type=cq:Template&p.limit=20";

            JsonNode response = aemHttpClient.get(queryPath);
            List<Map<String, Object>> templates = new ArrayList<>();

            if (response.has("hits") && response.get("hits").isArray()) {
                for (JsonNode hit : response.get("hits")) {
                    String path = getTextValue(hit, "path", null);
                    String title = getTextValue(hit, "jcr:content/jcr:title",
                        path != null ? path.substring(path.lastIndexOf('/') + 1) : "Unknown");

                    Map<String, Object> template = new HashMap<>();
                    template.put("path", path);
                    template.put("title", title);
                    templates.add(template);
                }
            }

            log.info("Found {} templates in AEM", templates.size());
            return templates.isEmpty() ? getDefaultTemplates() : templates;
        } catch (Exception e) {
            log.warn("Failed to get templates from AEM: {}", e.getMessage());
            return getDefaultTemplates();
        }
    }

    private List<Map<String, Object>> getDefaultTemplates() {
        return List.of(
            Map.of("path", "/conf/wknd/settings/wcm/templates/page-content", "title", "Content Page"),
            Map.of("path", "/conf/wknd/settings/wcm/templates/landing-page", "title", "Landing Page"),
            Map.of("path", "/conf/wknd/settings/wcm/templates/article-page", "title", "Article Page")
        );
    }

    // ========== Webhook Event Handlers ==========

    /**
     * Handle page created event
     */
    public void onPageCreated(String path, String user) {
        log.info("Page created: {} by {}", path, user);
        lastEventTimes.put("page_created_" + path, System.currentTimeMillis());
    }

    /**
     * Handle page modified event
     */
    public void onPageModified(String path, String user) {
        log.info("Page modified: {} by {}", path, user);
        lastEventTimes.put("page_modified_" + path, System.currentTimeMillis());
    }

    /**
     * Handle page deleted event
     */
    public void onPageDeleted(String path, String user) {
        log.info("Page deleted: {} by {}", path, user);
    }

    /**
     * Handle page published event
     */
    public void onPagePublished(String path, String user) {
        log.info("Page published: {} by {}", path, user);
        lastEventTimes.put("page_published_" + path, System.currentTimeMillis());
    }

    /**
     * Handle page unpublished event
     */
    public void onPageUnpublished(String path, String user) {
        log.info("Page unpublished: {} by {}", path, user);
    }

    /**
     * Handle asset created event
     */
    public void onAssetCreated(String path, String user) {
        log.info("Asset created: {} by {}", path, user);
    }

    /**
     * Handle asset updated event
     */
    public void onAssetUpdated(String path, String user) {
        log.info("Asset updated: {} by {}", path, user);
    }

    /**
     * Handle asset deleted event
     */
    public void onAssetDeleted(String path, String user) {
        log.info("Asset deleted: {} by {}", path, user);
    }

    /**
     * Handle workflow started event
     */
    public void onWorkflowStarted(String payloadPath, String user) {
        log.info("Workflow started: {} by {}", payloadPath, user);
    }

    /**
     * Handle workflow completed event
     */
    public void onWorkflowCompleted(String payloadPath, String user) {
        log.info("Workflow completed: {} by {}", payloadPath, user);
    }

    /**
     * Handle workflow step event
     */
    public void onWorkflowStep(String workflowModel, String stepName, String status, String payloadPath) {
        log.info("Workflow step: model={}, step={}, status={}, payload={}",
            workflowModel, stepName, status, payloadPath);
    }

    /**
     * Get recent event times for a path
     */
    public Map<String, Long> getRecentEvents(String path) {
        Map<String, Long> events = new ConcurrentHashMap<>();
        String prefix = path.replace("/", "_");
        lastEventTimes.entrySet().stream()
            .filter(e -> e.getKey().contains(prefix))
            .forEach(e -> events.put(e.getKey(), e.getValue()));
        return events;
    }

    private String getTextValue(JsonNode node, String field, String defaultValue) {
        if (node == null) return defaultValue;

        // Handle nested paths like "jcr:content/metadata/dc:title"
        String[] parts = field.split("/");
        JsonNode current = node;
        for (String part : parts) {
            if (current == null || !current.has(part)) {
                return defaultValue;
            }
            current = current.get(part);
        }

        return current.isTextual() ? current.asText() : defaultValue;
    }
}
