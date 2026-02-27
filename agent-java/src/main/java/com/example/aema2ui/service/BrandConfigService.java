package com.example.aema2ui.service;

import com.example.aema2ui.model.BrandConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BrandConfigService {

    private static final Logger logger = LoggerFactory.getLogger(BrandConfigService.class);
    private static final String DEFAULT_BRAND_ID = "default";

    private final ObjectMapper objectMapper;
    private final Map<String, BrandConfig> brandConfigs = new ConcurrentHashMap<>();

    @Value("${aem.agent.brand.config-path:${user.home}/.aem-a2ui/brands}")
    private String configPath;

    public BrandConfigService() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @PostConstruct
    public void init() {
        loadAllBrandConfigs();
    }

    private void loadAllBrandConfigs() {
        Path brandDir = Paths.get(configPath);
        if (!Files.exists(brandDir)) {
            try {
                Files.createDirectories(brandDir);
                logger.info("Created brand config directory: {}", brandDir);
                createDefaultBrandConfig(brandDir);
            } catch (IOException e) {
                logger.error("Failed to create brand config directory: {}", e.getMessage());
                return;
            }
        }

        try (var files = Files.list(brandDir)) {
            files.filter(p -> p.toString().endsWith(".json"))
                .forEach(this::loadBrandConfig);
        } catch (IOException e) {
            logger.error("Failed to load brand configs: {}", e.getMessage());
        }

        if (brandConfigs.isEmpty()) {
            logger.warn("No brand configs found. Using embedded default.");
        } else {
            logger.info("Loaded {} brand configurations", brandConfigs.size());
        }
    }

    private void loadBrandConfig(Path filePath) {
        try {
            String content = Files.readString(filePath);
            BrandConfig config = objectMapper.readValue(content, BrandConfig.class);
            if (config.getId() == null) {
                config.setId(filePath.getFileName().toString().replace(".json", ""));
            }
            brandConfigs.put(config.getId(), config);
            logger.debug("Loaded brand config: {}", config.getId());
        } catch (IOException e) {
            logger.error("Failed to load brand config from {}: {}", filePath, e.getMessage());
        }
    }

    private void createDefaultBrandConfig(Path brandDir) throws IOException {
        BrandConfig defaultConfig = new BrandConfig();
        defaultConfig.setId(DEFAULT_BRAND_ID);
        defaultConfig.setName("Acme Corp");
        defaultConfig.setTagline("Innovation for Tomorrow");

        BrandConfig.Voice voice = new BrandConfig.Voice();
        voice.setTone(List.of("Professional", "Innovative", "Trustworthy"));
        voice.setAvoid(List.of("Jargon", "Passive voice", "Superlatives"));
        defaultConfig.setVoice(voice);

        BrandConfig.Messaging messaging = new BrandConfig.Messaging();
        messaging.setValuePillars(List.of("Speed & Efficiency", "Enterprise Security", "Seamless Integration"));
        messaging.setTargetAudience("Enterprise IT decision-makers");
        defaultConfig.setMessaging(messaging);

        BrandConfig.Visuals visuals = new BrandConfig.Visuals();
        visuals.setStyleKeywords(List.of("clean", "modern", "minimal"));
        visuals.setBrandColors(List.of("#0066CC", "#FF6B35", "#2D3436"));
        defaultConfig.setVisuals(visuals);

        BrandConfig.Examples examples = new BrandConfig.Examples();
        examples.setGoodHeadlines(List.of("Transform Your Workflow in Minutes", "Security That Scales With You"));
        examples.setCtaPhrases(List.of("Get Started", "Learn More", "Contact Sales"));
        defaultConfig.setExamples(examples);

        saveBrandConfig(defaultConfig);
        logger.info("Created default brand config at: {}", brandDir.resolve(DEFAULT_BRAND_ID + ".json"));
    }

    public Optional<BrandConfig> getBrandConfig(String id) {
        BrandConfig config = brandConfigs.get(id);
        if (config == null && DEFAULT_BRAND_ID.equals(id)) {
            config = brandConfigs.get(DEFAULT_BRAND_ID);
        }
        return Optional.ofNullable(config);
    }

    public BrandConfig getActiveBrandConfig() {
        return brandConfigs.getOrDefault(DEFAULT_BRAND_ID, createEmbeddedDefault());
    }

    public List<BrandConfig> getAllBrandConfigs() {
        return new ArrayList<>(brandConfigs.values());
    }

    public BrandConfig saveBrandConfig(BrandConfig config) {
        if (config.getId() == null || config.getId().isBlank()) {
            config.setId(UUID.randomUUID().toString());
        }
        brandConfigs.put(config.getId(), config);

        try {
            Path brandDir = Paths.get(configPath);
            Files.createDirectories(brandDir);
            Path filePath = brandDir.resolve(config.getId() + ".json");
            String json = objectMapper.writeValueAsString(config);
            Files.writeString(filePath, json);
            logger.info("Saved brand config: {} to {}", config.getId(), filePath);
        } catch (IOException e) {
            logger.error("Failed to save brand config {}: {}", config.getId(), e.getMessage());
        }

        return config;
    }

    public boolean deleteBrandConfig(String id) {
        if (DEFAULT_BRAND_ID.equals(id)) {
            logger.warn("Cannot delete default brand config");
            return false;
        }

        BrandConfig removed = brandConfigs.remove(id);
        if (removed != null) {
            try {
                Path filePath = Paths.get(configPath, id + ".json");
                Files.deleteIfExists(filePath);
                logger.info("Deleted brand config: {}", id);
                return true;
            } catch (IOException e) {
                logger.error("Failed to delete brand config {}: {}", id, e.getMessage());
            }
        }
        return false;
    }

    private BrandConfig createEmbeddedDefault() {
        BrandConfig config = new BrandConfig();
        config.setId(DEFAULT_BRAND_ID);
        config.setName("Default Brand");
        config.setTagline("Brand-Aware AI");

        BrandConfig.Voice voice = new BrandConfig.Voice();
        voice.setTone(List.of("Professional"));
        voice.setAvoid(List.of("Jargon"));
        config.setVoice(voice);

        BrandConfig.Messaging messaging = new BrandConfig.Messaging();
        messaging.setValuePillars(List.of("Quality", "Innovation"));
        messaging.setTargetAudience("General");
        config.setMessaging(messaging);

        return config;
    }

    public String getConfigPath() {
        return configPath;
    }
}
