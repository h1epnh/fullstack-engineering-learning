package com.ewalletlab.bnplservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/** Any whole-đồng amount up to the current total due (late fees can make it a non-round number,
 * so there's no 1.000đ floor here). */
public record RepayRequestDto(@NotNull @DecimalMin("1") @Digits(integer = 15, fraction = 0) BigDecimal amount) {
}
