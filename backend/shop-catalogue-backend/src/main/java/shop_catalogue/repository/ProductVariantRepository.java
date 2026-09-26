package shop_catalogue.repository;

import shop_catalogue.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    List<ProductVariant> findByProductIdAndActiveTrueOrderByIdAsc(Long productId);
}
