package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record DissolveRequestDto(
    @NotNull UUID requesterUserId
) {
}
