package com.example.aema2ui.service;

public enum FeatureFlag {
    DEMO_ENABLED("aem.demo.enabled", true),
    AI_ENABLED("aem.agent.ai.enabled", false),
    IMS_AUTH("security.ims.enabled", false),
    AEM_INTEGRATION("aem.enabled", true);

    private final String propertyKey;
    private final boolean defaultValue;

    FeatureFlag(String propertyKey, boolean defaultValue) {
        this.propertyKey = propertyKey;
        this.defaultValue = defaultValue;
    }

    public String getPropertyKey() {
        return propertyKey;
    }

    public boolean getDefaultValue() {
        return defaultValue;
    }
}
