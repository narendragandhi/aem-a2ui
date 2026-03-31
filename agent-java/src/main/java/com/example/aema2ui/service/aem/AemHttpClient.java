package com.example.aema2ui.service.aem;

import com.example.aema2ui.config.AemConfig;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.function.Supplier;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Base HTTP client for AEM SDK integration.
 * Provides authenticated access to AEM REST APIs.
 */
@Slf4j
@Service
public class AemHttpClient {

    private final AemConfig config;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final AtomicBoolean connected = new AtomicBoolean(false);
    private final AtomicReference<Instant> lastHealthCheck = new AtomicReference<>(Instant.EPOCH);

    private static final Duration HEALTH_CHECK_INTERVAL = Duration.ofSeconds(30);

    public AemHttpClient(AemConfig config, ObjectMapper objectMapper) {
        this.config = config;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .requestFactory(createRequestFactory())
                .defaultHeader(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                .build();

        // Initial health check
        checkConnection();
    }

    /**
     * Check if AEM is enabled and connected
     */
    public boolean isConnected() {
        if (!config.isEnabled()) {
            return false;
        }

        // Refresh health check if stale
        Instant now = Instant.now();
        Instant lastCheck = lastHealthCheck.get();
        if (Duration.between(lastCheck, now).compareTo(HEALTH_CHECK_INTERVAL) > 0) {
            checkConnection();
        }

        return connected.get();
    }

    /**
     * Perform health check against AEM
     */
    public boolean checkConnection() {
        if (!config.isEnabled()) {
            connected.set(false);
            return false;
        }

        return withRetry(() -> {
            try {
                String response = restClient.get()
                        .uri(config.getAuthorUrl() + "/libs/granite/core/content/login.html")
                        .retrieve()
                        .body(String.class);

                boolean isConnected = response != null && !response.isEmpty();
                connected.set(isConnected);
                lastHealthCheck.set(Instant.now());

                if (isConnected) {
                    log.info("AEM connection successful: {}", config.getAuthorUrl());
                }
                return isConnected;
            } catch (Exception e) {
                log.warn("AEM connection failed: {} - {}", config.getAuthorUrl(), e.getMessage());
                connected.set(false);
                lastHealthCheck.set(Instant.now());
                return false;
            }
        });
    }

    /**
     * GET request returning raw JSON
     */
    public JsonNode get(String path) {
        return withRetry(() -> {
            try {
                String response = restClient.get()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .retrieve()
                        .body(String.class);

                return objectMapper.readTree(response);
            } catch (Exception e) {
                log.error("AEM GET failed: {} - {}", path, e.getMessage());
                throw new AemClientException("GET request failed: " + path, e);
            }
        });
    }

    /**
     * GET request with type conversion
     */
    public <T> T get(String path, Class<T> responseType) {
        return withRetry(() -> {
            try {
                return restClient.get()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .retrieve()
                        .body(responseType);
            } catch (Exception e) {
                log.error("AEM GET failed: {} - {}", path, e.getMessage());
                throw new AemClientException("GET request failed: " + path, e);
            }
        });
    }

    /**
     * GET request returning Map
     */
    public Map<String, Object> getAsMap(String path) {
        return withRetry(() -> {
            try {
                String response = restClient.get()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .retrieve()
                        .body(String.class);

                return objectMapper.readValue(response, new TypeReference<>() {});
            } catch (Exception e) {
                log.error("AEM GET failed: {} - {}", path, e.getMessage());
                throw new AemClientException("GET request failed: " + path, e);
            }
        });
    }

    /**
     * POST JSON request
     */
    public JsonNode post(String path, Object body) {
        return withRetry(() -> {
            try {
                String requestBody = objectMapper.writeValueAsString(body);
                String response = restClient.post()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .retrieve()
                        .body(String.class);

                return response != null ? objectMapper.readTree(response) : null;
            } catch (Exception e) {
                log.error("AEM POST failed: {} - {}", path, e.getMessage());
                throw new AemClientException("POST request failed: " + path, e);
            }
        });
    }

    /**
     * POST form data (for Sling POST servlet)
     */
    public String postForm(String path, Map<String, String> formData) {
        return withRetry(() -> {
            try {
                MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
                formData.forEach(form::add);

                return restClient.post()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .body(form)
                        .retrieve()
                        .body(String.class);
            } catch (Exception e) {
                log.error("AEM POST form failed: {} - {}", path, e.getMessage());
                throw new AemClientException("POST form request failed: " + path, e);
            }
        });
    }

    /**
     * DELETE request
     */
    public void delete(String path) {
        withRetry(() -> {
            try {
                restClient.delete()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .retrieve()
                        .toBodilessEntity();
                return null;
            } catch (Exception e) {
                log.error("AEM DELETE failed: {} - {}", path, e.getMessage());
                throw new AemClientException("DELETE request failed: " + path, e);
            }
        });
    }

    /**
     * Get AEM configuration
     */
    public AemConfig getConfig() {
        return config;
    }

    /**
     * Get AEM Author URL
     */
    public String getAuthorUrl() {
        return config.getAuthorUrl();
    }

    /**
     * GET request returning binary data (for images, files, etc.)
     * @param path The path to fetch
     * @return byte array of the response body, or null if failed
     */
    public byte[] getBinary(String path) {
        return withRetry(() -> {
            try {
                return restClient.get()
                        .uri(config.getAuthorUrl() + path)
                        .header(HttpHeaders.AUTHORIZATION, createBasicAuthHeader())
                        .retrieve()
                        .body(byte[].class);
            } catch (Exception e) {
                log.error("AEM GET binary failed: {} - {}", path, e.getMessage());
                return null;
            }
        });
    }

    /**
     * Create Basic Auth header value
     */
    private String createBasicAuthHeader() {
        String credentials = config.getUsername() + ":" + config.getPassword();
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes());
    }

    private SimpleClientHttpRequestFactory createRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(config.getConnectTimeout());
        factory.setReadTimeout(config.getReadTimeout());
        return factory;
    }

    private <T> T withRetry(Supplier<T> operation) {
        int maxAttempts = Math.max(1, config.getMaxRetries());
        int attempt = 0;
        while (true) {
            attempt++;
            try {
                return operation.get();
            } catch (Exception e) {
                if (attempt >= maxAttempts) {
                    throw e;
                }
                try {
                    Thread.sleep(config.getRetryDelayMillis());
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw e;
                }
            }
        }
    }

    /**
     * Custom exception for AEM client errors
     */
    public static class AemClientException extends RuntimeException {
        public AemClientException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
