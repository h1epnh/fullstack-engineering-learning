package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.VoucherPassPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoucherPassPurchaseRepository extends JpaRepository<VoucherPassPurchase, UUID> {
    List<VoucherPassPurchase> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

