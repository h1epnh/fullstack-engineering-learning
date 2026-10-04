package com.ewalletlab.paymentrequestservice.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Issue #11 — creates N independently-payable shares at once. Exactly one of 2 modes must be used
 * (validated in {@code PaymentRequestService.createSplit}, not via bean validation annotations,
 * same reason bill-payment-service's amount is validated server-side rather than trusted from the
 * client): either (a) {@code totalAmount} + {@code peopleCount} for an even split, or (b)
 * {@code amounts} for custom per-person amounts. Sending both or neither is a 400.
 *
 * <p>{@code peopleCount}/{@code amounts} size bounded 2–20 — a self-chosen limit, NOT a number
 * MoMo's (now-discontinued) split-bill feature ever published (no public source found for a real
 * limit — see backend DESIGN.md's "Chia tiền" section).
 *
 * <p>{@code totalAmount}/each element of {@code amounts} capped at 100.000.000đ, mirroring
 * {@code CreateLinkRequestDto} — every share ultimately settles through transfer-service's real
 * {@code /transfers} (same P2P cap, issue #6).
 */
public record CreateSplitRequestDto(
    @NotNull UUID creatorUserId,
    @NotBlank String creatorPhone,
    @NotBlank String creatorName,
    @NotBlank String label,
    String message,
    @DecimalMin("0.02") @DecimalMax("100000000") BigDecimal totalAmount,
    @Min(2) @Max(20) Integer peopleCount,
    @Valid List<@NotNull @DecimalMin("0.01") @DecimalMax("100000000") BigDecimal> amounts
) {
}
