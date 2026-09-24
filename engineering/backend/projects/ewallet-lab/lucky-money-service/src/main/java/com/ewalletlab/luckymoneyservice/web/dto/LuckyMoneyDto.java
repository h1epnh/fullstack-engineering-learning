package com.ewalletlab.luckymoneyservice.web.dto;

import com.ewalletlab.luckymoneyservice.domain.LuckyMoney;
import com.ewalletlab.luckymoneyservice.domain.LuckyMoneyStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LuckyMoneyDto(
    UUID id,
    UUID fromUserId,
    String fromName,
    UUID toUserId,
    String toPhone,
    BigDecimal amount,
    String message,
    LuckyMoneyStatus status,
    Instant createdAt,
    Instant expiresAt,
    Instant claimedAt,
    Instant refundedAt
) {
    public static LuckyMoneyDto from(LuckyMoney lm) {
        return new LuckyMoneyDto(
            lm.getId(), lm.getFromUserId(), lm.getFromName(), lm.getToUserId(), lm.getToPhone(), lm.getAmount(),
            lm.getMessage(), lm.getStatus(), lm.getCreatedAt(), lm.getExpiresAt(),
            lm.getClaimedAt(), lm.getRefundedAt());
    }
}
