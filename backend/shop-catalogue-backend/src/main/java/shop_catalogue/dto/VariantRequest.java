package shop_catalogue.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record VariantRequest(
        @NotBlank String size,
        @NotBlank String unit,
        @NotNull @DecimalMin("0.0") BigDecimal mrp,
        boolean active
) {}
