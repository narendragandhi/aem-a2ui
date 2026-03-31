package com.example.aema2ui.controller;

import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.model.BrandValidationResult;
import com.example.aema2ui.model.ContentSuggestion;
import com.example.aema2ui.service.AemIntegrationService;
import com.example.aema2ui.service.BrandConfigService;
import com.example.aema2ui.service.BrandValidationService;
import com.example.aema2ui.service.LocalizationService;
import com.example.aema2ui.service.aem.AemUniversalEditorService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

    /**
     * Demo endpoints for AG-UI / A2UI scenarios.
     */
@RestController
@RequestMapping("/demo")
public class DemoController {

    @Value("${aem.demo.enabled:true}")
    private boolean demoEnabled;

    private final BrandConfigService brandConfigService;
    private final BrandValidationService brandValidationService;
    private final AemUniversalEditorService aemUniversalEditorService;
    private final AemIntegrationService aemIntegrationService;
    private final LocalizationService localizationService;

    public DemoController(
            BrandConfigService brandConfigService,
            BrandValidationService brandValidationService,
            AemUniversalEditorService aemUniversalEditorService,
            AemIntegrationService aemIntegrationService,
            LocalizationService localizationService) {
        this.brandConfigService = brandConfigService;
        this.brandValidationService = brandValidationService;
        this.aemUniversalEditorService = aemUniversalEditorService;
        this.aemIntegrationService = aemIntegrationService;
        this.localizationService = localizationService;
    }

    @PostMapping("/governance/check")
    public ResponseEntity<Map<String, Object>> governanceCheck(@RequestBody GovernanceRequest request) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        BrandConfig brandConfig = request.brandId != null
            ? brandConfigService.getBrandConfig(request.brandId).orElse(brandConfigService.getActiveBrandConfig())
            : brandConfigService.getActiveBrandConfig();

        BrandValidationResult validation = brandValidationService.validate(request.content, brandConfig);
        Map<String, Object> seo = simpleSeoScore(request.content);

        return ResponseEntity.ok(Map.of(
            "brand", validation,
            "seo", seo
        ));
    }

    /**
     * Return AEM component field schema for dialog-less configuration demos.
     */
    @GetMapping("/component-schema")
    public ResponseEntity<Map<String, Object>> componentSchema(@RequestParam(defaultValue = "hero") String type) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        Map<String, Object> schema = aemUniversalEditorService.getFieldSchema(type);
        return ResponseEntity.ok(Map.of(
            "componentType", type,
            "schema", schema != null ? schema : Map.of()
        ));
    }

    /**
     * Search DAM assets and return a curated selection (demo mode).
     */
    @GetMapping("/dam-assembly")
    public ResponseEntity<Map<String, Object>> damAssembly(@RequestParam(defaultValue = "adventure") String query) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        List<Map<String, Object>> assets = aemIntegrationService.searchDamAssets(query, "image");
        Map<String, Object> selected = assets.isEmpty() ? null : assets.get(0);
        return ResponseEntity.ok(Map.of(
            "query", query,
            "assets", assets,
            "selected", selected
        ));
    }

    /**
     * Create persona-specific variants from a base content suggestion.
     */
    @PostMapping("/personalize")
    public ResponseEntity<Map<String, Object>> personalize(@RequestBody PersonalizeRequest request) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        Map<String, ContentSuggestion> variants = new LinkedHashMap<>();
        List<String> personas = request.personas != null ? request.personas : List.of("Executive", "Developer");
        for (String persona : personas) {
            variants.put(persona, personaVariant(request.content, persona));
        }
        return ResponseEntity.ok(Map.of(
            "variants", variants
        ));
    }

    /**
     * Localize content into target languages.
     */
    @PostMapping("/localize")
    public ResponseEntity<Map<String, Object>> localize(@RequestBody LocalizeRequest request) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        List<String> langs = request.languages != null ? request.languages : List.of("es-ES", "fr-FR");
        Map<String, ContentSuggestion> localized = localizationService.localize(request.content, langs);
        return ResponseEntity.ok(Map.of(
            "localized", localized
        ));
    }

    /**
     * Generate an Experience Fragment placeholder payload (demo mode).
     */
    @PostMapping("/xf")
    public ResponseEntity<Map<String, Object>> experienceFragment(@RequestBody XfRequest request) {
        if (!demoEnabled) {
            return ResponseEntity.status(404).body(Map.of("error", "Demo endpoints disabled"));
        }
        String basePath = "/content/experience-fragments/aem-a2ui";
        String name = request.name != null && !request.name.isBlank()
            ? request.name
            : "xf-" + System.currentTimeMillis();
        String path = basePath + "/" + name;
        return ResponseEntity.ok(Map.of(
            "path", path,
            "title", request.title != null ? request.title : "Experience Fragment",
            "status", "ready",
            "notes", "Generated XF structure (demo). Use Advanced Export panel for package generation."
        ));
    }

    private Map<String, Object> simpleSeoScore(ContentSuggestion content) {
        int score = 100;
        List<String> issues = new ArrayList<>();
        String title = content != null ? content.getTitle() : null;
        String desc = content != null ? content.getDescription() : null;
        if (title == null || title.length() < 10) {
            score -= 15;
            issues.add("Title too short");
        }
        if (title != null && title.length() > 60) {
            score -= 10;
            issues.add("Title too long");
        }
        if (desc == null || desc.length() < 50) {
            score -= 15;
            issues.add("Description too short");
        }
        if (desc != null && desc.length() > 160) {
            score -= 10;
            issues.add("Description too long");
        }
        return Map.of(
            "score", Math.max(0, score),
            "issues", issues
        );
    }

    private ContentSuggestion personaVariant(ContentSuggestion content, String persona) {
        ContentSuggestion variant = new ContentSuggestion();
        if (content == null) {
            return variant;
        }
        variant.setId(content.getId());
        variant.setComponentType(content.getComponentType());
        variant.setImageUrl(content.getImageUrl());
        variant.setImageAlt(content.getImageAlt());
        variant.setCtaUrl(content.getCtaUrl());
        variant.setPrice(content.getPrice());

        String prefix = "[" + persona + "] ";
        variant.setTitle(content.getTitle() != null ? prefix + content.getTitle() : null);
        variant.setSubtitle(content.getSubtitle());
        variant.setDescription(content.getDescription());
        variant.setCtaText(content.getCtaText());
        return variant;
    }

    @Data
    public static class GovernanceRequest {
        private String brandId;
        private ContentSuggestion content;
    }

    @Data
    public static class PersonalizeRequest {
        private ContentSuggestion content;
        private List<String> personas;
    }

    @Data
    public static class LocalizeRequest {
        private ContentSuggestion content;
        private List<String> languages;
    }

    @Data
    public static class XfRequest {
        private String name;
        private String title;
    }
}
