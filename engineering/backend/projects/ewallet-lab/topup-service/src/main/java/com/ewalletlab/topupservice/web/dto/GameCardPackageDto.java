package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.GamePublisher;
import java.math.BigDecimal;

public record GameCardPackageDto(
    GamePublisher publisher,
    String publisherName,
    String description,
    BigDecimal denomination,
    BigDecimal discountRate,
    BigDecimal finalPrice
) {
}
