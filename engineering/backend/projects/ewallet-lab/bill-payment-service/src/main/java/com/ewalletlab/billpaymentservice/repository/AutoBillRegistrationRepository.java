package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AutoBillRegistrationRepository extends JpaRepository<AutoBillRegistration, UUID> {
    List<AutoBillRegistration> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AutoBillRegistration> findByStatusAndAutoPayDay(AutoBillStatus status, Integer autoPayDay);

    List<AutoBillRegistration> findByStatus(AutoBillStatus status);

    Optional<AutoBillRegistration> findByUserIdAndCategoryAndCustomerCodeAndStatus(
        UUID userId, BillCategory category, String customerCode, AutoBillStatus status);
}

