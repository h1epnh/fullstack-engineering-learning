package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.SavingsPocket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SavingsPocketRepository extends JpaRepository<SavingsPocket, UUID> {
    Optional<SavingsPocket> findByWalletId(UUID walletId);
}
