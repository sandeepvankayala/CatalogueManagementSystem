package shop_catalogue.repository;

import shop_catalogue.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgencyRepository extends JpaRepository<Agency, Long> {
    List<Agency> findByActiveTrueOrderByDisplayOrderAscNameAsc();
    Optional<Agency> findByNameIgnoreCase(String name);
}
