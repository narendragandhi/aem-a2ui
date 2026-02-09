package com.example.aema2ui.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.TimeUnit;

/**
 * Configuration properties for AEM SDK integration.
 *
 * Supports connection to local AEM SDK for:
 * - Workflow API integration
 * - Content storage (pages, content fragments)
 * - DAM asset browsing and upload
 *
 * Production recommendations:
 * - Use environment variables for credentials (AEM_USERNAME, AEM_PASSWORD)
 * - Consider using AEM service users instead of admin credentials
 * - Enable HTTPS for the author URL in production
 * - Configure appropriate timeouts based on network latency
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "aem")
public class AemConfig {

    private static final Logger logger = LoggerFactory.getLogger(AemConfig.class);

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /**
     * Enable/disable real AEM integration.
     * When disabled, mock implementations are used.
     */
    private boolean enabled = true;

    /**
     * AEM Author instance URL (e.g., http://localhost:4502)
     */
    private String authorUrl = "http://localhost:4502";

    /**
     * AEM Publish instance URL (e.g., http://localhost:4503)
     */
    private String publishUrl = "http://localhost:4503";

    /**
     * AEM username for authentication.
     * WARNING: Use environment variables in production (AEM_USERNAME)
     */
    private String username = "admin";

    /**
     * AEM password for authentication.
     * WARNING: Use environment variables in production (AEM_PASSWORD)
     */
    private String password = "admin";

    /**
     * Root path for content pages
     */
    private String contentRoot = "/content/aem-demo";

    /**
     * Root path for DAM assets
     */
    private String damRoot = "/content/dam/aem-demo";

    /**
     * Path to workflow models
     */
    private String workflowModelsPath = "/var/workflow/models";

    /**
     * Connection timeout in milliseconds
     */
    private int connectTimeout = 5000;

    /**
     * Read timeout in milliseconds
     */
    private int readTimeout = 30000;

    /**
     * Maximum retry attempts for failed requests
     */
    private int maxRetries = 3;

    /**
     * Delay between retry attempts in milliseconds
     */
    private int retryDelayMillis = 1000;

    @PostConstruct
    public void validateConfiguration() {
        if (!enabled) {
            logger.info("AEM integration is disabled. Using mock mode.");
            return;
        }

        // Warn about default credentials
        if ("admin".equals(username) && "admin".equals(password)) {
            logger.warn("⚠️  AEM is configured with default admin credentials. " +
                       "For production, use environment variables AEM_USERNAME and AEM_PASSWORD " +
                       "with a dedicated service user account.");
        }

        // Warn about HTTP in production (if URL doesn't start with localhost or docker internal)
        if (authorUrl != null && authorUrl.startsWith("http://") &&
            !authorUrl.contains("localhost") && !authorUrl.contains("127.0.0.1") &&
            !authorUrl.contains("host.docker.internal")) {
            logger.warn("⚠️  AEM Author URL uses HTTP ({}). " +
                       "Consider using HTTPS for production environments.", authorUrl);
        }

        // Validate URL format
        if (authorUrl == null || authorUrl.isBlank()) {
            logger.error("AEM Author URL is not configured. Set aem.author-url property.");
        }

        // Log configuration summary
        logger.info("AEM Configuration: enabled={}, authorUrl={}, contentRoot={}, damRoot={}",
            enabled, authorUrl, contentRoot, damRoot);
    }

    /**
     * Check if AEM is configured for a non-localhost environment.
     * Useful for determining if extra security precautions should be taken.
     * Recognizes localhost, 127.0.0.1, and host.docker.internal as local.
     */
    public boolean isRemoteAem() {
        return authorUrl != null &&
               !authorUrl.contains("localhost") &&
               !authorUrl.contains("127.0.0.1") &&
               !authorUrl.contains("host.docker.internal");
    }

    /**
     * Get the full AEM editor URL for a given content path.
     */
    public String getEditorUrl(String contentPath) {
        return authorUrl + "/editor.html" + contentPath + ".html";
    }

    /**
     * Get the full AEM sites console URL.
     */
    public String getSitesConsoleUrl() {
        return authorUrl + "/sites.html" + contentRoot;
    }

    /**
     * Get the full AEM DAM console URL.
     */
    public String getDamConsoleUrl() {
        return authorUrl + "/assets.html" + damRoot;
    }
}
