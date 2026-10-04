package com.ewalletlab.fundservice.web.dto;

import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.domain.FundTransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FundTransactionDto(
    UUID id,
    UUID actorUserId,
    FundTransactionType type,
    BigDecimal amount,
    Instant createdAt
) {
    public static FundTransactionDto from(FundTransaction tx) {
        return new FundTransactionDto(tx.getId(), tx.getActorUserId(), tx.getType(), tx.getAmount(), tx.getCreatedAt());
    }
}
