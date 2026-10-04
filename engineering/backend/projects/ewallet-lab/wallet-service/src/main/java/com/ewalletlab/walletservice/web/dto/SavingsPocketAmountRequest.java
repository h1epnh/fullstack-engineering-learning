package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Shared request body for open/deposit/withdraw on "Túi Thần Tài" (issue #13). Same upper cap as
 * {@code AdjustBalanceRequest} (issue #6's verified MoMo max wallet balance, 200.000.000đ) since a
 * pocket move is ultimately bounded by the main wallet's own per-call cap. */
public record SavingsPocketAmountRequest(
    @NotNull @DecimalMin("0.01") @DecimalMax("200000000") BigDecimal amount
) {
}
