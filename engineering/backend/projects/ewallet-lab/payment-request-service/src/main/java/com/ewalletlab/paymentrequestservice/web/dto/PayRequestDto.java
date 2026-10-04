package com.ewalletlab.paymentrequestservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * {@code stepUpConfirmed} — issue #15 interaction discovered while building #11: paying a
 * LINK/REMINDER/split-share ultimately calls transfer-service's real {@code /transfers}, which can
 * now require step-up confirmation for amounts/daily totals over threshold (see wallet-service's
 * StepUpPolicy). Without this field there was no way to retry with confirmation, and the 428 from
 * transfer-service would have surfaced as a raw 500 here (only Conflict/NotFound were explicitly
 * handled). Null/missing = "chưa xác nhận", same convention as every other DTO that added this
 * field for issue #15.
 */
public record PayRequestDto(@NotNull UUID payerUserId, Boolean stepUpConfirmed) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
