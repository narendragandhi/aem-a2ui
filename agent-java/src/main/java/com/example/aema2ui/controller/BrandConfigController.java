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
    public BrandConfig getActiveBrand() {
        return brandConfigService.getActiveBrandConfig();
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
}
