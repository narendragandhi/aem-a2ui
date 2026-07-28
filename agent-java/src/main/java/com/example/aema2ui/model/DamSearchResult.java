package com.example.aema2ui.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Result from AEM DAM asset search.
 * Contains matching assets found for the content generation context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DamSearchResult {

    private boolean searchSuccessful;
    private String searchQuery;
    private int totalResults;
    private List<DamAsset> assets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamAsset {
        private String id;
        private String name;
        private String path;
        private String mimeType;
        private String thumbnailUrl;
        private String description;
    }

    public static DamSearchResult empty(String query) {
        return DamSearchResult.builder()
            .searchSuccessful(true)
            .searchQuery(query)
            .totalResults(0)
            .assets(List.of())
            .build();
    }
}
