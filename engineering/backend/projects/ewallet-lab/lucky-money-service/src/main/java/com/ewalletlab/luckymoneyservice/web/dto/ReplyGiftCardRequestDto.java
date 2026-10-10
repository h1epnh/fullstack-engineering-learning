package com.ewalletlab.luckymoneyservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record ReplyGiftCardRequestDto(
    @NotNull UUID recipientUserId,
    @NotBlank @Size(max = 255) String replyMessage
) {}
