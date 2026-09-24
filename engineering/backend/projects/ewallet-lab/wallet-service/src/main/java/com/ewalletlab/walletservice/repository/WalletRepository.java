package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    Optional<Wallet> findByUserId(UUID userId);
}
