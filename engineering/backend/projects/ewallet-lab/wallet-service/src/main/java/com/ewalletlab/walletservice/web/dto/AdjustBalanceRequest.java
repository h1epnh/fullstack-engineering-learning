package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.TransactionType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * See issue #6: no caller-facing DTO in this lab had an upper bound on amount, unlike MoMo's real,
 * verified per-day limits (momo.vn/hoi-dap/han-muc-giao-dich-moi-ngay: max wallet balance
 * 200.000.000đ, deposits up to 100.000.000đ/ngày via wallet-to-wallet transfer, withdrawals/payments
 * up to 50.000.000đ/ngày). This is the shared internal credit/debit endpoint every other service
 * calls into, so its cap is set to MoMo's verified max wallet balance (200.000.000đ) as a ceiling
 * on any single ledger entry — the caller-facing DTOs (topup-service, transfer-service) apply the
 * tighter, flow-specific real limits on top of this. This is an adapted per-call cap, not a true
 * daily aggregate limit (this lab doesn't track rolling daily totals) — documented as such in
 * DESIGN.md.
 */
public record AdjustBalanceRequest(
    @NotNull @DecimalMin("0.01") @DecimalMax("200000000") BigDecimal amount,
    @NotNull TransactionType type,
    String reference,
    String note,
    /**
     * Issue #15 (mô phỏng QĐ 2345/QĐ-NHNN's step-up authentication) — only meaningful on
     * {@code /debit} for a type in {@link com.ewalletlab.walletservice.service.WalletMutationExecutor}'s
     * step-up scope. {@code null}/missing is treated as "not confirmed", same as {@code false} —
     * callers only need to set this to {@code true} when retrying a request after the user has
     * gone through the (simulated) step-up confirmation. Not used by {@code /credit}: the only
     * credit-scoped type in step-up scope is TOPUP, whose actual credit happens asynchronously via
     * Kafka (see wallet-service's TopupConfirmedListener) with no HTTP caller present to carry this
     * flag — TOPUP's step-up gate instead runs synchronously in topup-service at initiation time,
     * against wallet-service's read-only GET /wallets/{userId}/step-up-check. See backend
     * DESIGN.md's "Step-up xác thực" section for the full reasoning.
     */
    Boolean stepUpConfirmed
) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
