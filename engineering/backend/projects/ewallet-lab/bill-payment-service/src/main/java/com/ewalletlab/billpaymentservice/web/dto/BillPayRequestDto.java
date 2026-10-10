package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.PaymentSource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Deliberately does NOT carry an `amount` field — the amount is always recomputed server-side
 * from the same deterministic mock formula {@code /bills/lookup} used, so a payer can never pay a
 * different amount than what they were quoted (see BillPaymentService.mockDueAmount).
 */
public record BillPayRequestDto(
    @NotNull UUID userId,
    @NotNull BillCategory category,
    @NotBlank String customerCode,
    /** Issue #15 — see wallet-service's AdjustBalanceRequest javadoc; null/missing = "chưa xác nhận". */
    Boolean stepUpConfirmed,
    /** Issue #28 — Voucher Pass voucherId (tuỳ chọn) áp dụng giảm giá hoá đơn. */
    UUID voucherId,
    /** Issue #37 — Nguồn tiền thanh toán (mặc định MAIN_WALLET). */
    PaymentSource paymentSource
) {
    public BillPayRequestDto(UUID userId, BillCategory category, String customerCode, Boolean stepUpConfirmed, UUID voucherId) {
        this(userId, category, customerCode, stepUpConfirmed, voucherId, PaymentSource.MAIN_WALLET);
    }

    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }

    public PaymentSource getPaymentSource() {
        return paymentSource != null ? paymentSource : PaymentSource.MAIN_WALLET;
    }
}
