package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.Voucher;
import com.ewalletlab.loyaltyservice.domain.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    List<Voucher> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Voucher> findByUserIdAndStatusOrderByExpiresAtAsc(UUID userId, VoucherStatus status);
    List<Voucher> findByPassPurchaseId(UUID passPurchaseId);
}

