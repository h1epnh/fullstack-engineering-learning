package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.TelcoOrderType;
import com.ewalletlab.topupservice.domain.TelcoProvider;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateTelcoOrderRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "telcoProvider không được để trống")
    TelcoProvider telcoProvider,

    @NotNull(message = "orderType không được để trống")
    TelcoOrderType orderType,

    @NotNull(message = "denomination không được để trống")
    BigDecimal denomination,

    String phoneNumber,

    Boolean stepUpConfirmed
) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
