package shop_catalogue.repository;

import shop_catalogue.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAgencyIdAndActiveTrueOrderByNameAsc(Long agencyId);
    List<Product> findByActiveTrueAndAgencyActiveTrueAndNameContainingIgnoreCaseOrderByNameAsc(String name);
    List<Product> findByActiveTrueAndAgencyActiveTrueOrderByNameAsc();
}
