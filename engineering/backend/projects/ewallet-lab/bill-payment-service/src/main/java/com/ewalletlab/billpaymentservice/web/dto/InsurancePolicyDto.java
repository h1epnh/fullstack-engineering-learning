package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.InsurancePolicy;
import com.ewalletlab.billpaymentservice.domain.PolicyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record InsurancePolicyDto(
    UUID id,
    UUID userId,
    String productCode,
    String productName,
    String insuredName,
    String insuredIdCard,
    String vehiclePlate,
    BigDecimal premiumAmount,
    BigDecimal coverageAmount,
    LocalDate effectiveDate,
    LocalDate expiryDate,
    String certificateNumber,
    PolicyStatus status,
    Instant createdAt
) {
    public static InsurancePolicyDto from(InsurancePolicy policy, String productName) {
        return new InsurancePolicyDto(
            policy.getId(),
            policy.getUserId(),
            policy.getProductCode(),
            productName,
            policy.getInsuredName(),
            policy.getInsuredIdCard(),
            policy.getVehiclePlate(),
            policy.getPremiumAmount(),
            policy.getCoverageAmount(),
            policy.getEffectiveDate(),
            policy.getExpiryDate(),
            policy.getCertificateNumber(),
            policy.getStatus(),
            policy.getCreatedAt()
        );
    }
}
