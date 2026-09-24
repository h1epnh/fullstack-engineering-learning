package com.paymenthub.orchestrator.web.dto;

import com.paymenthub.orchestrator.domain.RailType;
import com.paymenthub.orchestrator.domain.Transaction;
import com.paymenthub.orchestrator.domain.TransactionStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    TransactionStatus status,
    RailType rail,
    BigDecimal amount,
    String currency
) {
    public static PaymentResponse from(Transaction transaction) {
        return new PaymentResponse(
            transaction.getId(),
            transaction.getStatus(),
            transaction.getRailType(),
            transaction.getAmount(),
            transaction.getCurrency()
        );
    }
}
