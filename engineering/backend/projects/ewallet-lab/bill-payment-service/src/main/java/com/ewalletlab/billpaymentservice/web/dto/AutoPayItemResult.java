package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;

import java.math.BigDecimal;
import java.util.UUID;

public record AutoPayItemResult(
    UUID registrationId,
    UUID userId,
    BillCategory category,
    String customerCode,
    BigDecimal amount,
    String status,
    String message
) {
}

