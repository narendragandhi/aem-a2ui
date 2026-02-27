package com.example.aema2ui.config;

import com.example.aema2ui.service.AemLiveConnectionService;
import com.example.aema2ui.service.AemLiveConnectionService.AemHealthStatus;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class AemHealthIndicator implements HealthIndicator {

    private final AemConfig aemConfig;
    private final AemLiveConnectionService connectionService;

    public AemHealthIndicator(AemConfig aemConfig, AemLiveConnectionService connectionService) {
        this.aemConfig = aemConfig;
        this.connectionService = connectionService;
    }

    @Override
    public Health health() {
        if (!aemConfig.isEnabled()) {
            return Health.down()
                    .withDetail("reason", "AEM integration is disabled")
                    .build();
        }

        try {
            AemHealthStatus status = connectionService.checkConnection();
            if (status.isConnected()) {
                return Health.up()
                        .withDetail("authorUrl", aemConfig.getAuthorUrl())
                        .withDetail("contentRoot", aemConfig.getContentRoot())
                        .build();
            } else {
                return Health.down()
                        .withDetail("reason", status.getMessage())
                        .withDetail("authorUrl", aemConfig.getAuthorUrl())
                        .build();
            }
        } catch (Exception e) {
            return Health.down()
                    .withDetail("reason", e.getMessage())
                    .withDetail("authorUrl", aemConfig.getAuthorUrl())
                    .build();
        }
    }
}
