package com.ewalletlab.transferservice.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferResponseDto(
    UUID fromUserId,
    UUID toUserId,
    String toName,
    BigDecimal newBalance,
    String greetingCardTheme,
    String greetingMessage
) {
    public TransferResponseDto(UUID fromUserId, UUID toUserId, String toName, BigDecimal newBalance) {
        this(fromUserId, toUserId, toName, newBalance, null, null);
    }
}

