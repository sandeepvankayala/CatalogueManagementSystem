package shop_catalogue.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import shop_catalogue.dto.*;
import shop_catalogue.entity.*;
import shop_catalogue.repository.*;

import java.util.Map;

@RestController
@RequestMapping("/api/owner")
public class OwnerController {

    private final AgencyRepository agencyRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public OwnerController(AgencyRepository agencyRepository,
                           ProductRepository productRepository,
                           ProductVariantRepository variantRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.agencyRepository = agencyRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Authentication's principal is the owner's email (see JwtAuthenticationFilter) -
    // this only ever changes the password of whoever's token made the request, never
    // an id passed in from the client.
    @PutMapping("/account/password")
    public ResponseEntity<?> changePassword(Authentication authentication,
                                            @Valid @RequestBody ChangePasswordRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }

    @PostMapping("/agencies")
    public ResponseEntity<?> createAgency(@Valid @RequestBody AgencyRequest request) {
        if (agencyRepository.findByNameIgnoreCase(request.name()).isPresent()) {
            throw new IllegalArgumentException("Agency already exists");
        }

        Agency agency = new Agency();
        agency.setName(request.name());
        agency.setLogoUrl(request.logoUrl());
        agency.setDescription(request.description());
        agency.setDisplayOrder(request.displayOrder());
        agency.setActive(request.active());

        return ResponseEntity.ok(agencyRepository.save(agency));
    }

    @PutMapping("/agencies/{id}")
    public ResponseEntity<?> updateAgency(@PathVariable Long id,
                                           @Valid @RequestBody AgencyRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agency not found"));

        agency.setName(request.name());
        agency.setLogoUrl(request.logoUrl());
        agency.setDescription(request.description());
        agency.setDisplayOrder(request.displayOrder());
        agency.setActive(request.active());

        return ResponseEntity.ok(agencyRepository.save(agency));
    }

    @DeleteMapping("/agencies/{id}")
    public ResponseEntity<?> deleteAgency(@PathVariable Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Agency not found"));
        agency.setActive(false);
        agencyRepository.save(agency);
        return ResponseEntity.ok(java.util.Map.of("message", "Agency deactivated"));
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest request) {
        Agency agency = agencyRepository.findById(request.agencyId())
                .orElseThrow(() -> new IllegalArgumentException("Agency not found"));

        Product product = new Product();
        product.setAgency(agency);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setImageUrl(request.imageUrl());
        product.setActive(request.active());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                            @Valid @RequestBody ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        Agency agency = agencyRepository.findById(request.agencyId())
                .orElseThrow(() -> new IllegalArgumentException("Agency not found"));

        product.setAgency(agency);
        product.setName(request.name());
        product.setDescription(request.description());
        product.setImageUrl(request.imageUrl());
        product.setActive(request.active());

        return ResponseEntity.ok(productRepository.save(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
        return ResponseEntity.ok(java.util.Map.of("message", "Product deactivated"));
    }

    @PostMapping("/products/{productId}/variants")
    public ResponseEntity<?> createVariant(@PathVariable Long productId,
                                           @Valid @RequestBody VariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSize(request.size());
        variant.setUnit(request.unit());
        variant.setMrp(request.mrp());
        variant.setActive(request.active());

        return ResponseEntity.ok(variantRepository.save(variant));
    }

    @PutMapping("/variants/{id}")
    public ResponseEntity<?> updateVariant(@PathVariable Long id,
                                           @Valid @RequestBody VariantRequest request) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Variant not found"));

        variant.setSize(request.size());
        variant.setUnit(request.unit());
        variant.setMrp(request.mrp());
        variant.setActive(request.active());

        return ResponseEntity.ok(variantRepository.save(variant));
    }

    @DeleteMapping("/variants/{id}")
    public ResponseEntity<?> deleteVariant(@PathVariable Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Variant not found"));
        variant.setActive(false);
        variantRepository.save(variant);
        return ResponseEntity.ok(java.util.Map.of("message", "Variant deactivated"));
    }
}
