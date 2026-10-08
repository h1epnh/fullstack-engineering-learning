package com.ewalletlab.investmentfundservice.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FundDto(
    UUID id,
    String code,
    String name,
    String description,
    BigDecimal nav,
    BigDecimal initialNav,
    BigDecimal returnRatePct,
    Instant updatedAt
) {
}

