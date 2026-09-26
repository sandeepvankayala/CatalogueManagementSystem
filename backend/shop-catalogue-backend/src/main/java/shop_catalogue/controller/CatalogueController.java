package shop_catalogue.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import shop_catalogue.entity.Product;
import shop_catalogue.entity.ProductVariant;
import shop_catalogue.repository.*;
import java.util.*;

@RestController
@RequestMapping("/api/catalogue")
public class CatalogueController {
    private final AgencyRepository agencyRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public CatalogueController(AgencyRepository agencyRepository, ProductRepository productRepository, ProductVariantRepository variantRepository) {
        this.agencyRepository = agencyRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @GetMapping("/agencies")
    public ResponseEntity<?> agencies() {
        return ResponseEntity.ok(agencyRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc());
    }

    // Lets a customer find a product by name across every agency at once, instead of
    // having to open each agency one by one to look for it.
    @GetMapping("/search")
    @Transactional(readOnly = true)
    public ResponseEntity<?> search(@RequestParam(required = false) String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        List<Product> products = productRepository
                .findByActiveTrueAndAgencyActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(q.trim());
        List<Map<String, Object>> result = products.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription() == null ? "" : p.getDescription());
            m.put("imageUrl", p.getImageUrl() == null ? "" : p.getImageUrl());
            m.put("agencyId", p.getAgency().getId());
            m.put("agencyName", p.getAgency().getName());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    // Every active product from every active agency at once, so a customer's first
    // screen can show products directly instead of forcing an agency pick first.
    @GetMapping("/products")
    @Transactional(readOnly = true)
    public ResponseEntity<?> allProducts() {
        List<Product> products = productRepository.findByActiveTrueAndAgencyActiveTrueOrderByNameAsc();
        List<Map<String, Object>> result = products.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription() == null ? "" : p.getDescription());
            m.put("imageUrl", p.getImageUrl() == null ? "" : p.getImageUrl());
            m.put("agencyId", p.getAgency().getId());
            m.put("agencyName", p.getAgency().getName());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/agencies/{agencyId}/products")
    public ResponseEntity<?> products(@PathVariable Long agencyId) {
        List<Product> products = productRepository.findByAgencyIdAndActiveTrueOrderByNameAsc(agencyId);
        List<Map<String, Object>> result = products.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription() == null ? "" : p.getDescription());
            m.put("imageUrl", p.getImageUrl() == null ? "" : p.getImageUrl());
            m.put("active", p.isActive());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<?> variants(@PathVariable Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductIdAndActiveTrueOrderByIdAsc(productId);
        List<Map<String, Object>> result = variants.stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", v.getId());
            m.put("size", v.getSize());
            m.put("unit", v.getUnit());
            m.put("mrp", v.getMrp());
            m.put("active", v.isActive());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }
}
