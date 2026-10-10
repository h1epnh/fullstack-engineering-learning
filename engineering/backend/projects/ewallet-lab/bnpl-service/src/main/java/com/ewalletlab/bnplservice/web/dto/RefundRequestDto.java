package com.ewalletlab.bnplservice.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RefundRequestDto(
    @NotNull @Positive BigDecimal amount,
    String reason
) {
}
