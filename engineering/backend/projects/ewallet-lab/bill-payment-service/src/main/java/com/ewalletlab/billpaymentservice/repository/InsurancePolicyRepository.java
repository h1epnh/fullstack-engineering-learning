package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.InsurancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, UUID> {

    List<InsurancePolicy> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<InsurancePolicy> findByCertificateNumber(String certificateNumber);
}
