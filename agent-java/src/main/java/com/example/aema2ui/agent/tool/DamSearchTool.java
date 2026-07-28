package com.example.aema2ui.agent.tool;

import com.example.aema2ui.model.DamSearchResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Tool for searching AEM DAM (Digital Asset Management) assets.
 * In production, this would connect to the AEM DAM HTTP API.
 * For demo purposes, returns simulated assets based on search query.
 */
@Slf4j
@Component
public class DamSearchTool {

    private static final Map<String, List<DamSearchResult.DamAsset>> SIMULATED_ASSETS = Map.of(
        "hero", List.of(
            DamSearchResult.DamAsset.builder()
                .id("dam-001").name("Mountain Landscape")
                .path("/content/dam/aem-demo/mountain-landscape.jpg")
                .mimeType("image/jpeg")
                .thumbnailUrl("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400")
                .description("Scenic mountain landscape for hero banners")
                .build(),
            DamSearchResult.DamAsset.builder()
                .id("dam-002").name("Team Collaboration")
                .path("/content/dam/aem-demo/team-collab.jpg")
                .mimeType("image/jpeg")
                .thumbnailUrl("https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400")
                .description("Team working together in modern office")
                .build()
        ),
        "product", List.of(
            DamSearchResult.DamAsset.builder()
                .id("dam-003").name("Dashboard Screenshot")
                .path("/content/dam/aem-demo/dashboard.jpg")
                .mimeType("image/jpeg")
                .thumbnailUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400")
                .description("Product dashboard screenshot")
                .build()
        ),
        "banner", List.of(
            DamSearchResult.DamAsset.builder()
                .id("dam-004")                .name("Summer Campaign")
                .path("/content/dam/aem-demo/summer-campaign.jpg")
                .mimeType("image/jpeg")
                .thumbnailUrl("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400")
                .description("Summer promotional banner background")
                .build()
        )
    );

    /**
     * Search DAM for assets matching the given query and component type.
     */
    public DamSearchResult search(String query, String componentType) {
        log.info("DAM Search: query='{}', type='{}'", query, componentType);

        String searchKey = componentType != null ? componentType.toLowerCase() : "hero";
        List<DamSearchResult.DamAsset> assets = SIMULATED_ASSETS.getOrDefault(searchKey,
            SIMULATED_ASSETS.get("hero"));

        DamSearchResult result = DamSearchResult.builder()
            .searchSuccessful(true)
            .searchQuery(query)
            .totalResults(assets.size())
            .assets(assets)
            .build();

        log.info("DAM Search found {} assets", assets.size());
        return result;
    }
}
