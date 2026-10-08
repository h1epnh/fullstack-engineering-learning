package com.ewalletlab.investmentfundservice.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record NavHistoryDto(
    UUID id,
    BigDecimal nav,
    Instant recordedAt
) {
}

