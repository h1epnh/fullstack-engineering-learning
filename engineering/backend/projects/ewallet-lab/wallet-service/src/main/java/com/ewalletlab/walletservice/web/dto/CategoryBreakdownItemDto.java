package com.ewalletlab.walletservice.web.dto;

import java.math.BigDecimal;

public record CategoryBreakdownItemDto(
    String categoryCode,
    String categoryName,
    String icon,
    String color,
    BigDecimal amount,
    Double percentage,
    int transactionCount
) {
}
