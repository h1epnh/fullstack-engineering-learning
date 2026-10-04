package com.ewalletlab.walletservice.service;

/**
 * Issue #15 — mô phỏng bước xác thực bổ sung (step-up) của QĐ 2345/QĐ-NHNN. Thrown when a debit
 * (or, via {@link WalletService#stepUpCheck}, a would-be TOPUP) crosses the single-transaction or
 * cumulative-daily threshold and the caller hasn't set {@code stepUpConfirmed=true} yet. Mapped by
 * {@code WalletController} to HTTP 428 (Precondition Required) — deliberately a different status
 * from the 409s already used for insufficient balance ({@link IllegalStateException}) and the
 * monthly outbound limit (issue #7, also {@link IllegalStateException}), so callers can tell "you
 * need to go confirm step-up and retry the exact same request" apart from "this request is simply
 * rejected, don't retry it as-is".
 */
public class StepUpRequiredException extends RuntimeException {
    public StepUpRequiredException(String message) {
        super(message);
    }
}
