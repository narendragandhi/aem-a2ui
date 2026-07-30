package com.example.aema2ui.service;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

@Service
public class FeatureFlagService {

    private final Environment environment;

    public FeatureFlagService(Environment environment) {
        this.environment = environment;
    }

    public boolean isEnabled(FeatureFlag flag) {
        String value = environment.getProperty(flag.getPropertyKey());
        if (value == null) {
            return flag.getDefaultValue();
        }
        return Boolean.parseBoolean(value);
    }

    public boolean isEnabled(String propertyKey, boolean defaultValue) {
        String value = environment.getProperty(propertyKey);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }
}
