package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.GamePublisher;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateGameCardOrderRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "publisher không được để trống")
    GamePublisher publisher,

    @NotNull(message = "denomination không được để trống")
    BigDecimal denomination,

    boolean stepUpConfirmed
) {
}
