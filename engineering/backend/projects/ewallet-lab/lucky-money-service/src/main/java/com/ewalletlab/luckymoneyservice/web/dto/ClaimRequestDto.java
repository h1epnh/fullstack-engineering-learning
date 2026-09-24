package com.ewalletlab.luckymoneyservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ClaimRequestDto(@NotNull UUID toUserId) {
}
