package shop_catalogue.repository;

import shop_catalogue.entity.ShopOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {
    List<ShopOrder> findAllByOrderByCreatedAtDesc();
    void deleteByCreatedAtBefore(LocalDateTime cutoff);
}
