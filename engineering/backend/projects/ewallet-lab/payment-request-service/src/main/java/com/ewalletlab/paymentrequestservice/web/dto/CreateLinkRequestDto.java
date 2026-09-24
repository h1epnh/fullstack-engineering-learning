package com.ewalletlab.paymentrequestservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * creatorPhone/creatorName come straight from the caller's session (mfe-transfer already has
 * both — packages/session's Session type), not re-looked-up server-side, same trust model
 * transferService.transfer(session.id, ...) already uses elsewhere in this lab.
 *
 * <p>Max mirrors transfer-service's own P2P transfer cap (issue #6: MoMo's verified real
 * wallet-to-wallet limit, 100.000.000đ) — this ultimately becomes a call into that exact same
 * saga, so there's no reason for a different ceiling here.
 */
public record CreateLinkRequestDto(
    @NotNull UUID creatorUserId,
    @NotBlank String creatorPhone,
    @NotBlank String creatorName,
    @NotNull @DecimalMin("0.01") @DecimalMax("100000000") BigDecimal amount,
    String message
) {
}
