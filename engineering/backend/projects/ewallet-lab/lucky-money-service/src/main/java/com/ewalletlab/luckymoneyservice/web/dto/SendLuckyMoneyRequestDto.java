package com.ewalletlab.luckymoneyservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Amount bounds are MoMo's own verified real limit for a 1-recipient lucky money, NOT the
 * different 100.000.000đ P2P transfer cap (issue #6/transfer-service) — different transaction
 * category, deliberately not reused. Source: momo.vn/hoi-dap/cach-li-xi-cho-1-nguoi, fetched
 * directly 2026-09-24 (agent-designer): "tối thiểu 1.000đ, tối đa 20.000.000đ".
 */
public record SendLuckyMoneyRequestDto(
    @NotNull UUID fromUserId,
    @NotBlank String fromName,
    @NotBlank String toPhone,
    @NotNull @DecimalMin("1000") @DecimalMax("20000000") BigDecimal amount,
    String message
) {
}
