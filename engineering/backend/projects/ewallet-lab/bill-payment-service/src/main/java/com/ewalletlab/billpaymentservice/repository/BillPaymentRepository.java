package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.BillPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BillPaymentRepository extends JpaRepository<BillPayment, UUID> {
    List<BillPayment> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
