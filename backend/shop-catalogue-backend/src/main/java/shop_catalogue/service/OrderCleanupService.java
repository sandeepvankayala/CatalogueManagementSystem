package shop_catalogue.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import shop_catalogue.repository.ShopOrderRepository;

import java.time.LocalDateTime;

@Service
public class OrderCleanupService {

    private final ShopOrderRepository orderRepository;

    public OrderCleanupService(ShopOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Runs every day at 2:00 AM server time.
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void deleteOrdersOlderThanTenDays() {
        orderRepository.deleteByCreatedAtBefore(LocalDateTime.now().minusDays(10));
    }
}
