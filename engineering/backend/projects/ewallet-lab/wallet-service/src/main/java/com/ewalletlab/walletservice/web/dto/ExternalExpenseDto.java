package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.ExternalExpenseEntry;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExternalExpenseDto(
    UUID id,
    UUID userId,
    BigDecimal amount,
    String categoryCode,
    String note,
    Instant spentAt,
    Instant createdAt
) {
    public static ExternalExpenseDto from(ExternalExpenseEntry entry) {
        return new ExternalExpenseDto(
            entry.getId(),
            entry.getUserId(),
            entry.getAmount(),
            entry.getCategoryCode(),
            entry.getNote(),
            entry.getSpentAt(),
            entry.getCreatedAt()
        );
    }
}
