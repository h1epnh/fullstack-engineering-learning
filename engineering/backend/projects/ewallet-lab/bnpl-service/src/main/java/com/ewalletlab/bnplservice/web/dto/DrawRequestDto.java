package com.ewalletlab.bnplservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Free-text label ("Mua sắm"...) — a mock draw, no merchant behind it. Upper bound is the
 * remaining available limit, checked in the service. */
public record DrawRequestDto(
    @NotNull @DecimalMin("1000") @Digits(integer = 15, fraction = 0) BigDecimal amount,
    @Size(max = 100) String label
) {
}
