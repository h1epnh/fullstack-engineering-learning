package com.ewalletlab.transferservice.web.dto;

import com.ewalletlab.transferservice.domain.RecurringFrequency;
import com.ewalletlab.transferservice.domain.RecurringTransfer;
import com.ewalletlab.transferservice.domain.RecurringTransferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record RecurringTransferDto(
    UUID id,
    UUID senderId,
    String recipientPhone,
    UUID recipientUserId,
    BigDecimal amount,
    String message,
    RecurringFrequency frequency,
    Integer executionDay,
    LocalDate startDate,
    LocalDate endDate,
    RecurringTransferStatus status,
    LocalDate lastExecutionDate,
    LocalDate nextExecutionDate,
    Instant createdAt
) {
    public static RecurringTransferDto from(RecurringTransfer entity) {
        return new RecurringTransferDto(
            entity.getId(),
            entity.getSenderId(),
            entity.getRecipientPhone(),
            entity.getRecipientUserId(),
            entity.getAmount(),
            entity.getMessage(),
            entity.getFrequency(),
            entity.getExecutionDay(),
            entity.getStartDate(),
            entity.getEndDate(),
            entity.getStatus(),
            entity.getLastExecutionDate(),
            entity.getNextExecutionDate(),
            entity.getCreatedAt()
        );
    }
}
