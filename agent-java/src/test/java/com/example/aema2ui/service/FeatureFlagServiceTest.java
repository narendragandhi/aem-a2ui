package com.example.aema2ui.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class FeatureFlagServiceTest {

    @Autowired
    private FeatureFlagService featureFlagService;

    @Test
    void testDemoEnabledByDefault() {
        assertThat(featureFlagService.isEnabled(FeatureFlag.DEMO_ENABLED)).isTrue();
    }

    @Test
    void testAiDisabledByDefault() {
        assertThat(featureFlagService.isEnabled(FeatureFlag.AI_ENABLED)).isFalse();
    }

    @Test
    void testImsAuthDisabledByDefault() {
        assertThat(featureFlagService.isEnabled(FeatureFlag.IMS_AUTH)).isFalse();
    }

    @Test
    void testAemIntegrationDisabledInTest() {
        assertThat(featureFlagService.isEnabled(FeatureFlag.AEM_INTEGRATION)).isFalse();
    }

    @Test
    void testIsEnabledWithCustomProperty() {
        boolean result = featureFlagService.isEnabled("nonexistent.property", true);
        assertThat(result).isTrue();
    }

    @Test
    void testIsEnabledWithCustomPropertyDefaultFalse() {
        boolean result = featureFlagService.isEnabled("nonexistent.property", false);
        assertThat(result).isFalse();
    }
}
