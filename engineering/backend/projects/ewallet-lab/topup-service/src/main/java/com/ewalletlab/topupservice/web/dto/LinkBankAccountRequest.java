package com.ewalletlab.topupservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record LinkBankAccountRequest(
    @NotNull UUID userId,
    @NotBlank String bankCode,
    @NotBlank String accountNumber
) {
}
