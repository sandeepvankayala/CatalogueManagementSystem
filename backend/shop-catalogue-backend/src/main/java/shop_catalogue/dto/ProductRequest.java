package shop_catalogue.dto;

import jakarta.validation.constraints.NotBlank;

public record ProductRequest(
        @NotBlank String name,
        String description,
        String imageUrl,
        Long agencyId,
        boolean active
) {}
