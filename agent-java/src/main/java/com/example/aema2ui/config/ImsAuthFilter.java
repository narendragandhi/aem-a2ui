package com.example.aema2ui.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class ImsAuthFilter implements Filter {

    @Value("${security.ims.enabled:false}")
    private boolean imsEnabled;

    @Value("${security.ims.allowed-orgs:}")
    private String allowedOrgs;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        if (!imsEnabled) {
            chain.doFilter(req, res);
            return;
        }

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String path = request.getRequestURI();

        if (path.startsWith("/actuator/") || path.startsWith("/extension-panel")) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(401, "Missing IMS token");
            return;
        }

        String token = authHeader.substring(7);
        String orgId = request.getHeader("X-GW-IMS-Org-Id");

        if (orgId == null || orgId.isEmpty()) {
            response.sendError(401, "Missing IMS Org ID");
            return;
        }

        log.debug("IMS auth OK for org: {}", orgId);
        chain.doFilter(request, response);
    }
}
