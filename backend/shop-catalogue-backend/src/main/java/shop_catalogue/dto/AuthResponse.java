package shop_catalogue.dto;

public record AuthResponse(
        String token,
        Long userId,
        String name,
        String shopName,
        String role,
        String status
) {}
