package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AutoBillRegistrationDto(
    UUID id,
    UUID userId,
    BillCategory category,
    String customerCode,
    BigDecimal maxAmount,
    Integer autoPayDay,
    AutoBillStatus status,
    Instant createdAt,
    Instant updatedAt
) {
    public static AutoBillRegistrationDto from(AutoBillRegistration reg) {
        return new AutoBillRegistrationDto(
            reg.getId(),
            reg.getUserId(),
            reg.getCategory(),
            reg.getCustomerCode(),
            reg.getMaxAmount(),
            reg.getAutoPayDay(),
            reg.getStatus(),
            reg.getCreatedAt(),
            reg.getUpdatedAt()
        );
    }
}

