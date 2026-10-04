package com.ewalletlab.fundservice.web.dto;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FundDto(
    UUID id,
    UUID creatorUserId,
    String creatorName,
    String creatorPhone,
    String name,
    String purpose,
    BigDecimal balance,
    FundStatus status,
    Instant createdAt
) {
    public static FundDto from(Fund fund) {
        return new FundDto(fund.getId(), fund.getCreatorUserId(), fund.getCreatorName(), fund.getCreatorPhone(),
            fund.getName(), fund.getPurpose(), fund.getBalance(), fund.getStatus(), fund.getCreatedAt());
    }
}
