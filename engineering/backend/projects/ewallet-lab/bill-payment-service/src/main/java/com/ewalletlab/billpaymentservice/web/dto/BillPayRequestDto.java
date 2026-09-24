package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Deliberately does NOT carry an `amount` field — the amount is always recomputed server-side
 * from the same deterministic mock formula {@code /bills/lookup} used, so a payer can never pay a
 * different amount than what they were quoted (see BillPaymentService.mockDueAmount).
 */
public record BillPayRequestDto(
    @NotNull UUID userId,
    @NotNull BillCategory category,
    @NotBlank String customerCode
) {
}
