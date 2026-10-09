package com.ewalletlab.loyaltyservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/** Issue #38 — shared body shape for {@code POST /loyalty/check-in} and {@code POST
 * /loyalty/missions/{missionCode}/claim}, exactly the ticket's own spec ({@code {userId}}) — these
 * 2 endpoints don't have a userId path segment the way the rest of {@code LoyaltyController} does. */
public record UserIdRequestDto(@NotNull UUID userId) {
}
