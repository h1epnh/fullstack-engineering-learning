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
    String note
) {
}
