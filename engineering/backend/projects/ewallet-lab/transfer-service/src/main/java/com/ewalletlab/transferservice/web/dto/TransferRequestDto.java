package com.ewalletlab.transferservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Max (see issue #6): MoMo's verified real limit for wallet-to-wallet transfers is
 * 100.000.000đ/ngày — https://www.momo.vn/hoi-dap/han-muc-nap-rut-tien-moi-ngay-la-bao-nhieu.
 * Applied here as a per-transaction cap (adapted, not a true daily aggregate — see DESIGN.md).
 */
public record TransferRequestDto(
    @NotNull UUID fromUserId,
    @NotBlank String toPhone,
    @NotNull @DecimalMin("0.01") @DecimalMax("100000000") BigDecimal amount
) {
}
