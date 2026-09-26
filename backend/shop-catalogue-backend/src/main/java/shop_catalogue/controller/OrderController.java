package shop_catalogue.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import shop_catalogue.dto.OrderRequest;
import shop_catalogue.service.OrderService;

// Public endpoint - no customer login. The shop name and phone travel in the
// request body itself (captured at checkout on the frontend).
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest request) {
        String whatsappUrl = orderService.createOrder(request);
        return ResponseEntity.ok(new OrderResponse("Order saved successfully", whatsappUrl));
    }

    public record OrderResponse(String message, String whatsappUrl) {}
}
