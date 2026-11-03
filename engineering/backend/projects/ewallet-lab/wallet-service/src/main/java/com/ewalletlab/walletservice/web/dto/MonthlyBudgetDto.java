package com.ewalletlab.walletservice.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record MonthlyBudgetDto(
    UUID id,
    String month,
    String categoryCode,
    String categoryName,
    BigDecimal budgetLimit,
    BigDecimal spentAmount,
    Double percentage,
    String status // "SAFE" (< 80%), "WARNING_80" (80-99%), "EXCEEDED_100" (>= 100%)
) {
}
