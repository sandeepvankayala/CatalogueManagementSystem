package shop_catalogue.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shop_catalogue.dto.OrderRequest;
import shop_catalogue.entity.*;
import shop_catalogue.repository.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class OrderService {

    private final ProductVariantRepository variantRepository;
    private final ShopOrderRepository orderRepository;

    @Value("${shop.whatsapp.number}")
    private String whatsappNumber;

    public OrderService(ProductVariantRepository variantRepository,
                        ShopOrderRepository orderRepository) {
        this.variantRepository = variantRepository;
        this.orderRepository = orderRepository;
    }

    // No customer account/login involved - the shop name and phone come straight
    // from what the customer typed at checkout.
    @Transactional
    public String createOrder(OrderRequest request) {
        ShopOrder order = new ShopOrder();
        order.setShopName(request.shopName());
        order.setPhone(request.phone());
        order.setCreatedAt(java.time.LocalDateTime.now());
        order.setStatus(OrderStatus.NEW);

        for (var requestItem : request.items()) {
            ProductVariant variant = variantRepository.findById(requestItem.variantId())
                    .orElseThrow(() -> new IllegalArgumentException("Product variant not found: " + requestItem.variantId()));

            if (!variant.isActive() || !variant.getProduct().isActive() || !variant.getProduct().getAgency().isActive()) {
                throw new IllegalArgumentException("One of the selected products is not available");
            }

            OrderItem item = new OrderItem();
            item.setVariant(variant);
            item.setQuantity(requestItem.quantity());
            item.setProductName(variant.getProduct().getName());
            item.setSize(variant.getSize());
            item.setUnit(variant.getUnit());

            order.addItem(item);
        }

        orderRepository.save(order);

        return buildWhatsAppUrl(order);
    }

    private String buildWhatsAppUrl(ShopOrder order) {
        StringBuilder message = new StringBuilder();

        message.append("New Order\n\n");
        message.append("Shop: ").append(order.getShopName()).append("\n");
        message.append("Phone: ").append(order.getPhone()).append("\n");
        message.append("Date: ").append(formatDate(order.getCreatedAt().toLocalDate())).append("\n\n");
        message.append("Items:\n");

        int number = 1;
        for (OrderItem item : order.getItems()) {
            message.append(number++)
                    .append(". ")
                    .append(item.getProductName())
                    .append(" (")
                    .append(item.getSize())
                    .append(") — ")
                    .append(item.getQuantity())
                    .append(" ")
                    .append(item.getUnit())
                    .append("\n");
        }

        String encoded = URLEncoder.encode(message.toString(), StandardCharsets.UTF_8);
        return "https://wa.me/" + whatsappNumber + "?text=" + encoded;
    }

    private String formatDate(LocalDate date) {
        String value = date.format(DateTimeFormatter.ofPattern("d MMM uuuu"));
        return value.replace("Sep ", "Sept ");
    }
}
