package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.service.WalletService.StepUpCheckResult;

import java.math.BigDecimal;

/** Issue #15 — response for GET /wallets/{userId}/step-up-check, used by topup-service to decide
 * (before calling mock-bank-gateway) whether a TOPUP needs step-up confirmation. */
public record StepUpCheckResponse(
    boolean required,
    BigDecimal dailyTotalSoFar,
    BigDecimal singleThreshold,
    BigDecimal dailyThreshold
) {
    public static StepUpCheckResponse from(StepUpCheckResult result) {
        return new StepUpCheckResponse(result.required(), result.dailyTotalSoFar(),
            result.singleThreshold(), result.dailyThreshold());
    }
}
