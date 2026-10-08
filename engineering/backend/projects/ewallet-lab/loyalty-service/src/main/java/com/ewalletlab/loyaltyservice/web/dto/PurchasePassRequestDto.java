package com.ewalletlab.loyaltyservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record PurchasePassRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotBlank(message = "passCode không được để trống")
    String passCode
) {}

