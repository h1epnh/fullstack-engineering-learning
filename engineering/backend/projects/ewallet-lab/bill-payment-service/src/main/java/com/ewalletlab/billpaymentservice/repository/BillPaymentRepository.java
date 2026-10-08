package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface BillPaymentRepository extends JpaRepository<BillPayment, UUID> {
    List<BillPayment> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByCategoryAndCustomerCodeAndPeriod(BillCategory category, String customerCode, String period);

    boolean existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(
        BillCategory category, String customerCode, Instant createdAt);
}
