package com.example.aema2ui.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Security configuration with production-ready filters.
 *
 * Features:
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - Rate limiting per IP
 * - Optional API key authentication
 * - Request logging with tracing IDs
 *
 * Production configuration:
 * - Set security.api-key.enabled=true and configure security.api-key.value
 * - Set security.hsts.enabled=true when behind HTTPS
 * - Adjust security.rate-limit.requests-per-minute as needed
 */
@Configuration
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${security.api-key.enabled:false}")
    private boolean apiKeyEnabled;

    @Value("${security.api-key.value:}")
    private String apiKeyValue;

    @Value("${security.hsts.enabled:false}")
    private boolean hstsEnabled;

    @Value("${security.hsts.max-age:31536000}")
    private long hstsMaxAge;

    @Value("${security.rate-limit.requests-per-minute:60}")
    private int rateLimitRequestsPerMinute;

    @Value("${security.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;

    @Value("${security.ims.enabled:false}")
    private boolean imsEnabled;

    @Value("${security.ims.require-jwt:true}")
    private boolean imsRequireJwt;

    /**
     * Filter for security headers and request logging.
     */
    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilter() {
        FilterRegistrationBean<SecurityHeadersFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SecurityHeadersFilter(hstsEnabled, hstsMaxAge));
        registration.addUrlPatterns("/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    /**
     * Optional API key authentication filter.
     */
    @Bean
    public FilterRegistrationBean<ApiKeyFilter> apiKeyFilter() {
        FilterRegistrationBean<ApiKeyFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new ApiKeyFilter(apiKeyEnabled, apiKeyValue));
        registration.addUrlPatterns("/tasks", "/advanced/tasks", "/stream/*", "/recommend");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 2);
        return registration;
    }

    /**
     * Optional IMS authentication filter (stub).
     */
    @Bean
    public FilterRegistrationBean<ImsAuthFilter> imsAuthFilter() {
        FilterRegistrationBean<ImsAuthFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new ImsAuthFilter(imsEnabled, imsRequireJwt));
        registration.addUrlPatterns("/tasks", "/advanced/tasks", "/stream/*", "/recommend", "/aem/*", "/workflows/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return registration;
    }

    /**
     * Rate limiter filter.
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new RateLimitFilter(rateLimitEnabled, rateLimitRequestsPerMinute));
        registration.addUrlPatterns("/tasks", "/advanced/tasks", "/stream/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 3);
        return registration;
    }

    /**
     * Filter that adds security headers to all responses.
     */
    public static class SecurityHeadersFilter implements Filter {

        private final boolean hstsEnabled;
        private final long hstsMaxAge;

        public SecurityHeadersFilter(boolean hstsEnabled, long hstsMaxAge) {
            this.hstsEnabled = hstsEnabled;
            this.hstsMaxAge = hstsMaxAge;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            // Generate request ID for tracing
            String requestId = UUID.randomUUID().toString().substring(0, 8);
            httpResponse.setHeader("X-Request-Id", requestId);

            // Security headers
            httpResponse.setHeader("X-Content-Type-Options", "nosniff");
            httpResponse.setHeader("X-Frame-Options", "DENY");
            httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
            httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
            httpResponse.setHeader("Pragma", "no-cache");
            httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            httpResponse.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

            // Content Security Policy - allows WebSocket and live collaboration
            httpResponse.setHeader("Content-Security-Policy",
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' https: data: blob:; " +
                "font-src 'self' data:; " +
                "connect-src 'self' ws: wss:; " +
                "frame-ancestors 'none'");

            // HSTS header for HTTPS environments
            if (hstsEnabled) {
                httpResponse.setHeader("Strict-Transport-Security",
                    "max-age=" + hstsMaxAge + "; includeSubDomains");
            }

            // Log request
            long startTime = System.currentTimeMillis();
            String method = httpRequest.getMethod();
            String uri = httpRequest.getRequestURI();

            try {
                chain.doFilter(request, response);
            } finally {
                long duration = System.currentTimeMillis() - startTime;
                logger.info("[{}] {} {} - {} ({}ms)",
                        requestId, method, uri, httpResponse.getStatus(), duration);
            }
        }
    }

    /**
     * API key authentication filter for protected endpoints.
     */
    public static class ApiKeyFilter implements Filter {

        private static final Logger logger = LoggerFactory.getLogger(ApiKeyFilter.class);
        private static final String API_KEY_HEADER = "X-API-Key";
        private static final String API_KEY_PARAM = "api_key";

        // Public endpoints that don't require API key
        private static final Set<String> PUBLIC_PATHS = Set.of(
            "/",
            "/.well-known/agent-card.json",
            "/advanced/.well-known/agent-card.json",
            "/aem/health"
        );

        private final boolean enabled;
        private final String expectedApiKey;

        public ApiKeyFilter(boolean enabled, String expectedApiKey) {
            this.enabled = enabled;
            this.expectedApiKey = expectedApiKey;

            if (enabled && (expectedApiKey == null || expectedApiKey.isBlank())) {
                logger.warn("⚠️  API key authentication enabled but no key configured. " +
                           "Set security.api-key.value in application.properties");
            }
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            if (!enabled) {
                chain.doFilter(request, response);
                return;
            }

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            // Skip authentication for public paths
            String path = httpRequest.getRequestURI();
            if (PUBLIC_PATHS.contains(path)) {
                chain.doFilter(request, response);
                return;
            }

            // Check API key from header or query parameter
            String providedKey = httpRequest.getHeader(API_KEY_HEADER);
            if (providedKey == null || providedKey.isBlank()) {
                providedKey = httpRequest.getParameter(API_KEY_PARAM);
            }

            if (expectedApiKey != null && !expectedApiKey.isBlank() &&
                !expectedApiKey.equals(providedKey)) {
                logger.warn("Unauthorized request to {} from {}",
                    path, getClientIp(httpRequest));
                httpResponse.setStatus(401);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write(
                    "{\"error\":\"Unauthorized. Provide valid API key via X-API-Key header.\"}");
                return;
            }

            chain.doFilter(request, response);
        }

        private String getClientIp(HttpServletRequest request) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isEmpty()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
    }

    /**
     * IMS authentication filter (stub).
     * Accepts any bearer token when enabled, optionally requiring JWT format.
     */
    public static class ImsAuthFilter implements Filter {
        private static final Logger logger = LoggerFactory.getLogger(ImsAuthFilter.class);
        private static final String AUTH_HEADER = "Authorization";

        private final boolean enabled;
        private final boolean requireJwt;

        public ImsAuthFilter(boolean enabled, boolean requireJwt) {
            this.enabled = enabled;
            this.requireJwt = requireJwt;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            if (!enabled) {
                chain.doFilter(request, response);
                return;
            }

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            String auth = httpRequest.getHeader(AUTH_HEADER);
            if (auth == null || !auth.startsWith("Bearer ")) {
                httpResponse.setStatus(401);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"error\":\"Missing IMS bearer token\"}");
                return;
            }

            String token = auth.substring("Bearer ".length()).trim();
            if (requireJwt && token.split("\\.").length != 3) {
                logger.warn("IMS token is not in JWT format");
                httpResponse.setStatus(401);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write("{\"error\":\"Invalid IMS token format\"}");
                return;
            }

            chain.doFilter(request, response);
        }
    }

    /**
     * Rate limiter to prevent abuse.
     * In production, consider using Redis for distributed rate limiting.
     */
    public static class RateLimitFilter implements Filter {

        private static final long WINDOW_MS = 60_000;

        private final boolean enabled;
        private final int maxRequestsPerMinute;
        private final Map<String, RequestCounter> counters = new ConcurrentHashMap<>();

        public RateLimitFilter(boolean enabled, int maxRequestsPerMinute) {
            this.enabled = enabled;
            this.maxRequestsPerMinute = maxRequestsPerMinute;
        }

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {

            if (!enabled) {
                chain.doFilter(request, response);
                return;
            }

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            HttpServletResponse httpResponse = (HttpServletResponse) response;

            String clientIp = getClientIp(httpRequest);
            RequestCounter counter = counters.computeIfAbsent(clientIp,
                k -> new RequestCounter(maxRequestsPerMinute));

            if (counter.isRateLimited()) {
                httpResponse.setStatus(429);
                httpResponse.setContentType("application/json");
                httpResponse.setHeader("Retry-After", "60");
                httpResponse.getWriter().write(
                    "{\"error\":\"Too many requests. Please try again later.\",\"retry_after\":60}");
                return;
            }

            counter.increment();
            httpResponse.setHeader("X-RateLimit-Limit", String.valueOf(maxRequestsPerMinute));
            httpResponse.setHeader("X-RateLimit-Remaining", String.valueOf(counter.getRemaining()));
            httpResponse.setHeader("X-RateLimit-Reset", String.valueOf(counter.getResetTime()));

            chain.doFilter(request, response);
        }

        private String getClientIp(HttpServletRequest request) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isEmpty()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }

        private static class RequestCounter {
            private final int maxRequests;
            private final AtomicInteger count = new AtomicInteger(0);
            private volatile long windowStart = System.currentTimeMillis();

            RequestCounter(int maxRequests) {
                this.maxRequests = maxRequests;
            }

            boolean isRateLimited() {
                checkWindow();
                return count.get() >= maxRequests;
            }

            void increment() {
                checkWindow();
                count.incrementAndGet();
            }

            int getRemaining() {
                checkWindow();
                return Math.max(0, maxRequests - count.get());
            }

            long getResetTime() {
                return (windowStart + WINDOW_MS) / 1000;
            }

            private void checkWindow() {
                long now = System.currentTimeMillis();
                if (now - windowStart > WINDOW_MS) {
                    synchronized (this) {
                        if (now - windowStart > WINDOW_MS) {
                            count.set(0);
                            windowStart = now;
                        }
                    }
                }
            }
        }
    }
}
