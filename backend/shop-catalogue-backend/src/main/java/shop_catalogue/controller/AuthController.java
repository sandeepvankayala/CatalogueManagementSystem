package shop_catalogue.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import shop_catalogue.dto.*;
import shop_catalogue.service.AuthService;

// Only the shop owner/admin logs in. Customers browse and order with no account at all
// (see CatalogueController and OrderController, both public endpoints).
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
