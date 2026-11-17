package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.GamePublisher;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateGameCardOrderRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "publisher không được để trống")
    GamePublisher publisher,

    @NotNull(message = "denomination không được để trống")
    BigDecimal denomination,

    boolean stepUpConfirmed,

    /** Client-supplied key for THIS purchase attempt (scoped per user server-side). Resend the same
     * key on retry/double-click: a replay returns the existing order and never debits or issues a
     * second card. Optional only for backward compatibility; without it no dedupe is possible. */
    @Size(max = 100) String idempotencyKey
) {
}
