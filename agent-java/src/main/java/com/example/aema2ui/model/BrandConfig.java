package com.example.aema2ui.model;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class BrandConfig {
    private String id;
    private String name;
    private String tagline;
    private Voice voice;
    private Messaging messaging;
    private Visuals visuals;
    private Examples examples;
    private Map<String, Object> additionalConfig;

    @Data
    public static class Voice {
        private List<String> tone;
        private List<String> avoid;
    }

    @Data
    public static class Messaging {
        private List<String> valuePillars;
        private String targetAudience;
    }

    @Data
    public static class Visuals {
        private List<String> styleKeywords;
        private List<String> brandColors;
    }

    @Data
    public static class Examples {
        private List<String> goodHeadlines;
        private List<String> ctaPhrases;
    }
}
