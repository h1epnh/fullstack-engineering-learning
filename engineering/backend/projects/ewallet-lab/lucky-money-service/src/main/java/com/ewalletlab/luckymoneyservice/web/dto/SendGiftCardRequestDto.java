package com.ewalletlab.luckymoneyservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record SendGiftCardRequestDto(
    @NotNull UUID senderId,
    @NotBlank String senderName,
    @NotBlank String recipientPhone,
    @NotNull @DecimalMin("1000") BigDecimal amount,
    @NotBlank String templateCode,
    String customMessage,
    Boolean stepUpConfirmed
) {}
