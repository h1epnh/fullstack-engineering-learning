package com.paymenthub.orchestrator.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PaymentRequest(
    @NotBlank String sourceAccount,
    @NotBlank String destAccount,
    /** SWIFT BIC of the beneficiary bank. Required for non-VND (cross-border) payments. */
    @Size(min = 8, max = 11) String destBic,
    @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
    @NotBlank @Size(min = 3, max = 3) String currency,
    /**
     * Required only when destAccount is a VN phone number (e-wallet transfer): "MOMO" or
     * "ZALOPAY". The phone number alone doesn't say which wallet to use — see RoutingEngine.
     */
    String walletProvider
) {
}
