package com.ewalletlab.investmentfundservice.web.dto;

import com.ewalletlab.investmentfundservice.domain.InvestmentOrderType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record InvestmentOrderDto(
    UUID id,
    UUID fundId,
    String fundCode,
    String fundName,
    InvestmentOrderType type,
    BigDecimal amount,
    BigDecimal units,
    BigDecimal nav,
    Instant createdAt
) {
}

