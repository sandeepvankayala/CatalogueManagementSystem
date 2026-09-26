package shop_catalogue.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import shop_catalogue.entity.*;
import shop_catalogue.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${shop.owner.email}")
    private String email;

    @Value("${shop.owner.password}")
    private String password;

    @Value("${shop.owner.name}")
    private String name;

    @Value("${shop.owner.shop-name}")
    private String shopName;

    @Value("${shop.owner.phone}")
    private String phone;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail(email.toLowerCase())) {
            User owner = new User();
            owner.setName(name);
            owner.setShopName(shopName);
            owner.setPhone(phone);
            owner.setEmail(email.toLowerCase());
            owner.setPassword(passwordEncoder.encode(password));
            owner.setRole(Role.OWNER);
            owner.setStatus(UserStatus.APPROVED);
            userRepository.save(owner);

            System.out.println("Initial owner created: " + email);
        }
    }
}
