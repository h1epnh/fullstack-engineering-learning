package com.ewalletlab.walletservice.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record SpendingTransactionItemDto(
    UUID id,
    String source, // "WALLET" or "CASH"
    BigDecimal amount,
    String categoryCode,
    String categoryName,
    String icon,
    String color,
    String note,
    Instant spentAt
) {
}
