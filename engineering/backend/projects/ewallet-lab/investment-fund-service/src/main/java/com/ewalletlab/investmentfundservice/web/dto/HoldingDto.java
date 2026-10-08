package com.ewalletlab.investmentfundservice.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record HoldingDto(
    UUID fundId,
    String fundCode,
    String fundName,
    BigDecimal units,
    BigDecimal currentNav,
    BigDecimal totalInvested,
    BigDecimal currentValue,
    BigDecimal profitAmount,
    BigDecimal profitPct,
    Instant updatedAt
) {
}

