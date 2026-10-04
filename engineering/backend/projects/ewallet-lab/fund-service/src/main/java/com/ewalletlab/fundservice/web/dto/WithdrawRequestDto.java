package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record WithdrawRequestDto(
    @NotNull UUID requesterUserId,
    @NotNull @DecimalMin("1000") @DecimalMax("200000000") BigDecimal amount
) {
}
