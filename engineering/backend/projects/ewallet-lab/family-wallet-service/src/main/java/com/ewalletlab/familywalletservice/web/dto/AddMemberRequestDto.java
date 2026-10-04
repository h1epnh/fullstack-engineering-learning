package com.ewalletlab.familywalletservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/** Upper bound mirrors AdjustBalanceRequest's ceiling on wallet-service (issue #6's verified MoMo
 * max wallet balance, 200.000.000đ) — a per-member monthly limit larger than that would be
 * meaningless (the member's whole wallet can never hold that much anyway). */
public record AddMemberRequestDto(
    @NotNull UUID parentUserId,
    @NotBlank String memberPhone,
    @NotNull @DecimalMin("1") @DecimalMax("200000000") BigDecimal monthlyLimit
) {
}
