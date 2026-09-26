package shop_catalogue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ShopCatalogueApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopCatalogueApplication.class, args);
    }
}
