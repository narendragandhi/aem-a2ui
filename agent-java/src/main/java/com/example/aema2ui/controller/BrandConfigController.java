package com.example.aema2ui.controller;

import com.example.aema2ui.model.BrandConfig;
import com.example.aema2ui.service.BrandConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brands")
public class BrandConfigController {

    private final BrandConfigService brandConfigService;

    public BrandConfigController(BrandConfigService brandConfigService) {
        this.brandConfigService = brandConfigService;
    }

    @GetMapping
    public List<BrandConfig> listBrands() {
        return brandConfigService.getAllBrandConfigs();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandConfig> getBrand(@PathVariable String id) {
        return brandConfigService.getBrandConfig(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active")
    public BrandConfig getActiveBrand(@RequestParam(required = false) String siteKey) {
        return siteKey != null
            ? brandConfigService.getActiveBrandConfig(siteKey)
            : brandConfigService.getActiveBrandConfig();
    }

    @PutMapping("/active")
    public ResponseEntity<?> setActiveBrand(@RequestBody ActiveBrandRequest request) {
        if (request.getBrandId() == null || request.getBrandId().isBlank()) {
            return ResponseEntity.badRequest().body("brandId is required");
        }
        if (request.getSiteKey() != null && !request.getSiteKey().isBlank()) {
            brandConfigService.setActiveBrandForSite(request.getSiteKey(), request.getBrandId());
        } else {
            brandConfigService.setActiveBrand(request.getBrandId());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/active/map")
    public ResponseEntity<?> getActiveBrandMap() {
        return ResponseEntity.ok(brandConfigService.getSiteBrandMap());
    }

    @PostMapping
    public BrandConfig createBrand(@RequestBody BrandConfig config) {
        return brandConfigService.saveBrandConfig(config);
    }

    @PutMapping("/{id}")
    public BrandConfig updateBrand(@PathVariable String id, @RequestBody BrandConfig config) {
        config.setId(id);
        return brandConfigService.saveBrandConfig(config);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable String id) {
        return brandConfigService.deleteBrandConfig(id)
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
    }

    @lombok.Data
    public static class ActiveBrandRequest {
        private String brandId;
        private String siteKey;
    }
}
