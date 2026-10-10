package com.ewalletlab.luckymoneyservice.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OpenGiftCardRequestDto(
    @NotNull UUID recipientUserId
) {}
