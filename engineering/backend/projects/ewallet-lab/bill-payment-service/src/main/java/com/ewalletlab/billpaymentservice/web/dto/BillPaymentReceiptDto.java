package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.PaymentSource;

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
    BigDecimal finalAmount,
    PaymentSource paymentSource
) {
    public BillPaymentReceiptDto(UUID id, UUID userId, BillCategory category, String customerCode,
                                 BigDecimal amount, BigDecimal newBalance, Instant createdAt) {
        this(id, userId, category, customerCode, amount, newBalance, createdAt, BigDecimal.ZERO, null, amount, PaymentSource.MAIN_WALLET);
    }

    public BillPaymentReceiptDto(UUID id, UUID userId, BillCategory category, String customerCode,
                                 BigDecimal amount, BigDecimal newBalance, Instant createdAt,
                                 BigDecimal discountAmount, UUID voucherId, BigDecimal finalAmount) {
        this(id, userId, category, customerCode, amount, newBalance, createdAt, discountAmount, voucherId, finalAmount, PaymentSource.MAIN_WALLET);
    }
}
