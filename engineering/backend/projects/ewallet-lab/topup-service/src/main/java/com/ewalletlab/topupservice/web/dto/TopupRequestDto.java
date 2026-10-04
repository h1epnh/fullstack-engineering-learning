package com.ewalletlab.topupservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Minimum matches MoMo's own published first-deposit minimum for new accounts —
 * https://www.momo.vn/hoi-dap/cac-buoc-thuc-hien — 10,000đ (that page also notes a higher
 * 50,000đ minimum specifically for Agribank-linked accounts, which this lab doesn't
 * differentiate by bank).
 *
 * <p>Max (see issue #6): MoMo's verified real limit for topping up from a linked bank account is
 * 50.000.000đ/ngày — https://www.momo.vn/hoi-dap/han-muc-nap-rut-tien-moi-ngay-la-bao-nhieu. Applied
 * here as a per-transaction cap (adapted, not a true daily aggregate — this lab doesn't track
 * rolling daily totals per user; see DESIGN.md).
 */
public record TopupRequestDto(
    @NotNull UUID userId,
    @NotNull @DecimalMin("10000") @DecimalMax("50000000") BigDecimal amount,
    /** Issue #15 — mô phỏng QĐ 2345/QĐ-NHNN, áp dụng cả cho nạp ví (xem backend DESIGN.md's
     * "Step-up xác thực" cho lý do phạm vi). null/missing = "chưa xác nhận". */
    Boolean stepUpConfirmed
) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
