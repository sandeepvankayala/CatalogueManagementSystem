package shop_catalogue.dto;

import jakarta.validation.constraints.NotBlank;

public record AgencyRequest(
        @NotBlank String name,
        String logoUrl,
        String description,
        int displayOrder,
        boolean active
) {}
