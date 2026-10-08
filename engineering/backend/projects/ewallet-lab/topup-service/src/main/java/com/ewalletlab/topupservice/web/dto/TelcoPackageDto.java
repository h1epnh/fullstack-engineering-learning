package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.TelcoProvider;

import java.math.BigDecimal;

public record TelcoPackageDto(
    TelcoProvider provider,
    String providerName,
    BigDecimal denomination,
    BigDecimal discountRate,
    BigDecimal finalPrice
) {
}
