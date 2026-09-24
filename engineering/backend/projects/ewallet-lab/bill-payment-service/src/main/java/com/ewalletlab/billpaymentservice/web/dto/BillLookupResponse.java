package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;

import java.math.BigDecimal;

public record BillLookupResponse(
    BillCategory category,
    String customerCode,
    String customerName,
    BigDecimal amount,
    String period
) {
}
