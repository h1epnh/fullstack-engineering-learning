package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ContributeRequestDto(
    @NotNull UUID memberUserId,
    // 1.000đ tối thiểu/giao dịch — xác minh trực tiếp momo.vn/quy-nhom ("Quỹ nhóm" docs fetch, xem
    // backend DESIGN.md). Trần 200tr khớp trần per-call chung của AdjustBalanceRequest (issue #6).
    @NotNull @DecimalMin("1000") @DecimalMax("200000000") BigDecimal amount,
    /** Issue #15 interaction — see WalletServiceClient's javadoc. */
    Boolean stepUpConfirmed
) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
