package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.SavingsPocket;

import java.math.BigDecimal;
import java.time.Instant;

/** Issue #13. {@code opened=false} (all other fields null/zero) is a normal 200 response, used by
 * the frontend to show the "open a pocket" CTA rather than treating "never opened" as an error. */
public record SavingsPocketResponse(
    boolean opened,
    BigDecimal balance,
    BigDecimal annualRate,
    Instant openedAt
) {
    public static SavingsPocketResponse notOpened() {
        return new SavingsPocketResponse(false, BigDecimal.ZERO, null, null);
    }

    public static SavingsPocketResponse from(SavingsPocket pocket) {
        return new SavingsPocketResponse(true, pocket.getBalance(), pocket.getAnnualRate(), pocket.getOpenedAt());
    }
}
