package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import com.ewalletlab.walletservice.domain.SavingsGoalTransactionType;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SavingsGoalTransactionDto(
    UUID id,
    UUID goalId,
    BigDecimal amount,
    SavingsGoalTransactionType type,
    Instant createdAt
) {
    public static SavingsGoalTransactionDto from(SavingsGoalTransaction tx) {
        return new SavingsGoalTransactionDto(
            tx.getId(),
            tx.getGoalId(),
            tx.getAmount(),
            tx.getType(),
            tx.getCreatedAt()
        );
    }
}

