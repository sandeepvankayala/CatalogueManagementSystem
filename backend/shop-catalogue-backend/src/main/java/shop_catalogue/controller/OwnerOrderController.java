package shop_catalogue.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import shop_catalogue.entity.OrderItem;
import shop_catalogue.entity.OrderStatus;
import shop_catalogue.entity.ShopOrder;
import shop_catalogue.repository.ShopOrderRepository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner/orders")
public class OwnerOrderController {

    private final ShopOrderRepository orderRepository;

    public OwnerOrderController(ShopOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> allOrders() {
        List<Map<String, Object>> result = orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toMap)
                .toList();
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam OrderStatus status) {
        ShopOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        order.setStatus(status);
        orderRepository.save(order);

        return ResponseEntity.ok(toMap(order));
    }

    // Building a plain map (instead of returning the JPA entity) inside the transaction
    // guarantees every lazy field is safely initialized before Jackson ever sees it,
    // and it naturally avoids the ShopOrder <-> OrderItem circular reference.
    private Map<String, Object> toMap(ShopOrder order) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", order.getId());
        m.put("status", order.getStatus().name());
        m.put("createdAt", order.getCreatedAt());
        m.put("shopName", order.getShopName());
        m.put("phone", order.getPhone());

        List<Map<String, Object>> items = order.getItems().stream().map(this::itemToMap).toList();
        m.put("items", items);

        return m;
    }

    private Map<String, Object> itemToMap(OrderItem item) {
        Map<String, Object> im = new LinkedHashMap<>();
        im.put("id", item.getId());
        im.put("productName", item.getProductName());
        im.put("size", item.getSize());
        im.put("unit", item.getUnit());
        im.put("quantity", item.getQuantity());
        return im;
    }
}
