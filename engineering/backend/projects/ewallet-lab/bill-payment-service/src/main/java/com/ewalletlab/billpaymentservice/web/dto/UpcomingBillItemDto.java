package com.ewalletlab.billpaymentservice.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpcomingBillItemDto(
    UUID id,
    String type,
    String title,
    String customerCode,
    LocalDate dueDate,
    long daysUntilDue,
    BigDecimal expectedAmount,
    BigDecimal previousMonthAmount,
    Double changePercent,
    boolean isSpikeDetected,
    String status,
    String heldReason
) {
}
