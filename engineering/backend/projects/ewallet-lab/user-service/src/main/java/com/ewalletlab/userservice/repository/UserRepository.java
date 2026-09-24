package com.ewalletlab.userservice.repository;

import com.ewalletlab.userservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByPhone(String phone);
}
