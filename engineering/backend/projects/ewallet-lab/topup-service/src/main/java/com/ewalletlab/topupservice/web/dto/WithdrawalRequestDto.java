package com.ewalletlab.topupservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * No official MoMo-published minimum withdrawal amount was found while building this (unlike
 * top-up's 10,000đ — see momo.vn/hoi-dap/cac-buoc-thuc-hien) — only requiring a positive amount
 * here rather than inventing a round-number minimum that would look sourced but isn't.
 *
 * <p>Max (see issue #6): MoMo's verified real limit is "rút ra khỏi MoMo... tối đa 50.000.000đ/ngày"
 * — https://www.momo.vn/hoi-dap/han-muc-giao-dich-moi-ngay. Applied here as a per-transaction cap
 * (adapted, not a true daily aggregate — this lab doesn't track rolling daily totals per user; see
 * DESIGN.md).
 */
public record WithdrawalRequestDto(
    @NotNull UUID userId,
    @NotNull @DecimalMin("0.01") @DecimalMax("50000000") BigDecimal amount
) {
}
