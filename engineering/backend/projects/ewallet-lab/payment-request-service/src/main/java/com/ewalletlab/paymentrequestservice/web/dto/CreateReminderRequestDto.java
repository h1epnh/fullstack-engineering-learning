package com.ewalletlab.paymentrequestservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateReminderRequestDto(
    @NotNull UUID creatorUserId,
    @NotBlank String creatorPhone,
    @NotBlank String creatorName,
    @NotBlank String targetPhone,
    @NotNull @DecimalMin("0.01") @DecimalMax("100000000") BigDecimal amount,
    String message
) {
}
