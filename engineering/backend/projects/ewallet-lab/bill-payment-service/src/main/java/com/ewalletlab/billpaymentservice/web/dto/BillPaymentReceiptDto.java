package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BillPaymentReceiptDto(
    UUID id,
    UUID userId,
    BillCategory category,
    String customerCode,
    BigDecimal amount,
    BigDecimal newBalance,
    Instant createdAt,
    BigDecimal discountAmount,
    UUID voucherId,
    BigDecimal finalAmount
) {
    public BillPaymentReceiptDto(UUID id, UUID userId, BillCategory category, String customerCode,
                                 BigDecimal amount, BigDecimal newBalance, Instant createdAt) {
        this(id, userId, category, customerCode, amount, newBalance, createdAt, BigDecimal.ZERO, null, amount);
    }
}
