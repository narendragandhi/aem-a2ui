package com.example.aema2ui.service.aem;

import com.example.aema2ui.config.AemConfig;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;

/**
 * Client for AEM Content Fragment operations via GraphQL.
 * Supports querying, creating, and updating Content Fragments.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AemContentFragmentClient {

    private final AemHttpClient httpClient;
    private final AemConfig config;
    private final ObjectMapper objectMapper;
    private RestClient graphQlClient;

    private RestClient getGraphQlClient() {
        if (graphQlClient == null) {
            String credentials = config.getUsername() + ":" + config.getPassword();
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes());
            
            graphQlClient = RestClient.builder()
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Basic " + encoded)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                    .build();
        }
        return graphQlClient;
    }

    /**
     * Execute a GraphQL query against AEM GraphQL API
     */
    public JsonNode executeQuery(String query) {
        return executeQuery(query, Collections.emptyMap());
    }

    /**
     * Execute a GraphQL query with variables
     */
    public JsonNode executeQuery(String query, Map<String, Object> variables) {
        try {
            String graphqlEndpoint = config.getAuthorUrl() + "/graphql/execute.json";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            if (!variables.isEmpty()) {
                requestBody.put("variables", variables);
            }

            String response = getGraphQlClient()
                    .post()
                    .uri(graphqlEndpoint)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.error("GraphQL query failed: {}", e.getMessage());
            throw new RuntimeException("GraphQL query failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get persisted query by name
     */
    public JsonNode executePersistedQuery(String persistedQueryName) {
        return executePersistedQuery(persistedQueryName, Collections.emptyMap());
    }

    /**
     * Execute a persisted GraphQL query with variables
     */
    public JsonNode executePersistedQuery(String persistedQueryName, Map<String, Object> variables) {
        try {
            String endpoint = config.getAuthorUrl() + "/graphql/execute/" + persistedQueryName;
            
            String response = getGraphQlClient()
                    .post()
                    .uri(uriBuilder -> {
                        uriBuilder.path(endpoint);
                        variables.forEach((key, value) -> 
                            uriBuilder.queryParam(key, value));
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(String.class);

            return objectMapper.readTree(response);
        } catch (Exception e) {
            log.error("Persisted query failed: {} - {}", persistedQueryName, e.getMessage());
            throw new RuntimeException("Persisted query failed: " + e.getMessage(), e);
        }
    }

    /**
     * List all Content Fragment Models
     */
    public List<Map<String, String>> listContentFragmentModels() {
        try {
            String query = """
                {
                  modelList {
                    name
                    title
                    path
                    schema
                  }
                }
                """;
            
            JsonNode result = executeQuery(query);
            List<Map<String, String>> models = new ArrayList<>();
            
            if (result.has("data") && result.get("data").has("modelList")) {
                JsonNode modelList = result.get("data").get("modelList");
                for (JsonNode model : modelList) {
                    Map<String, String> modelInfo = new HashMap<>();
                    modelInfo.put("name", getTextValue(model, "name", ""));
                    modelInfo.put("title", getTextValue(model, "title", ""));
                    modelInfo.put("path", getTextValue(model, "path", ""));
                    models.add(modelInfo);
                }
            }
            
            return models;
        } catch (Exception e) {
            log.warn("Failed to list CF models: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Query Content Fragments by model
     */
    public List<Map<String, Object>> queryContentFragments(String modelName, int limit) {
        try {
            String persistedQuery = "my-project/" + modelName + "-list";
            
            Map<String, Object> variables = Map.of("limit", limit);
            JsonNode result = executePersistedQuery(persistedQuery, variables);
            
            List<Map<String, Object>> fragments = new ArrayList<>();
            
            if (result.has("data")) {
                JsonNode dataNode = result.get("data");
                dataNode.fields().forEachRemaining(entry -> {
                    if (entry.getValue().isArray()) {
                        for (JsonNode fragment : entry.getValue()) {
                            fragments.add(objectMapper.convertValue(fragment, new TypeReference<>() {}));
                        }
                    }
                });
            }
            
            return fragments;
        } catch (Exception e) {
            log.warn("Failed to query Content Fragments for model {}: {}", modelName, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Get a single Content Fragment by path
     */
    public Map<String, Object> getContentFragment(String path) {
        try {
            String[] parts = path.split("/");
            String modelName = parts[parts.length - 2];
            String fragmentName = parts[parts.length - 1];
            
            String query = """
                query GetFragment($name: String!) {
                  fragmentList(filter: {
                    _path: {
                      _expressions: [{ value: $name, _operator: EQUALS }]
                    }
                  }) {
                    items {
                      _path
                      _model {
                        _path
                      }
                    }
                  }
                }
                """;
            
            Map<String, Object> variables = Map.of("name", path);
            JsonNode result = executeQuery(query, variables);
            
            if (result.has("data") && result.get("data").has("fragmentList")) {
                JsonNode items = result.get("data").get("fragmentList").get("items");
                if (items.isArray() && items.size() > 0) {
                    return objectMapper.convertValue(items.get(0), new TypeReference<>() {});
                }
            }
            
            return null;
        } catch (Exception e) {
            log.error("Failed to get Content Fragment: {}", path, e);
            return null;
        }
    }

    /**
     * Create a Content Fragment via Assets API
     */
    public String createContentFragment(String parentPath, String name, String modelPath, Map<String, Object> data) {
        try {
            String fragmentPath = parentPath + "/" + name;
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("class", "dam:Asset");
            
            Map<String, Object> content = new HashMap<>();
            content.put("jcr:primaryType", "dam:AssetContent");
            content.put("data", Map.of(
                "jcr:primaryType", "nt:unstructured",
                "cq:model", modelPath
            ));
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("jcr:primaryType", "dam:meta");
            metadata.put("dc:title", name);
            metadata.put("model", modelPath);
            
            content.put("metadata", metadata);
            
            // Add fragment data as element values
            Map<String, Object> master = new HashMap<>();
            data.forEach((key, value) -> master.put(key, Map.of(
                "jcr:primaryType", "nt:unstructured",
                "value", value != null ? value.toString() : ""
            )));
            content.put("master", master);
            
            requestBody.put("jcr:content", content);
            
            httpClient.post(fragmentPath, requestBody);
            log.info("Created Content Fragment: {}", fragmentPath);
            
            return fragmentPath;
        } catch (Exception e) {
            log.error("Failed to create Content Fragment: {}/{}", parentPath, name, e);
            throw new RuntimeException("Failed to create Content Fragment: " + e.getMessage(), e);
        }
    }

    /**
     * Update a Content Fragment
     */
    public void updateContentFragment(String path, Map<String, Object> data) {
        try {
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            
            data.forEach((key, value) -> 
                content.put(key, Map.of(
                    "jcr:primaryType", "nt:unstructured",
                    "value", value != null ? value.toString() : ""
                )));
            
            requestBody.put("jcr:content/data/master", content);
            
            httpClient.post(path, requestBody);
            log.info("Updated Content Fragment: {}", path);
        } catch (Exception e) {
            log.error("Failed to update Content Fragment: {}", path, e);
            throw new RuntimeException("Failed to update Content Fragment: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a Content Fragment
     */
    public void deleteContentFragment(String path) {
        try {
            httpClient.delete(path);
            log.info("Deleted Content Fragment: {}", path);
        } catch (Exception e) {
            log.error("Failed to delete Content Fragment: {}", path, e);
            throw new RuntimeException("Failed to delete Content Fragment: " + e.getMessage(), e);
        }
    }

    private String getTextValue(JsonNode node, String field, String defaultValue) {
        if (node == null || !node.has(field)) return defaultValue;
        JsonNode value = node.get(field);
        return value.isTextual() ? value.asText() : defaultValue;
    }
}
