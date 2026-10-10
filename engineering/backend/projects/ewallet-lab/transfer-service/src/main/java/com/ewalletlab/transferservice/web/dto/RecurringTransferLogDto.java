package com.ewalletlab.transferservice.web.dto;

import com.ewalletlab.transferservice.domain.RecurringExecutionStatus;
import com.ewalletlab.transferservice.domain.RecurringTransferLog;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecurringTransferLogDto(
    UUID id,
    UUID recurringTransferId,
    Instant executedAt,
    BigDecimal amount,
    RecurringExecutionStatus status,
    String errorMessage
) {
    public static RecurringTransferLogDto from(RecurringTransferLog entity) {
        return new RecurringTransferLogDto(
            entity.getId(),
            entity.getRecurringTransferId(),
            entity.getExecutedAt(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getErrorMessage()
        );
    }
}
