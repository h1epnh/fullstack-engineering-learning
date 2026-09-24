package com.paymenthub.ledger.util;

/**
 * Account numbers are "deposit/account information" under Vietnam's Decree 13/2023/ND-CP on
 * personal data protection (superseded by the Personal Data Protection Law effective 1/1/2026) —
 * both classify it as data requiring minimization, including in logs. This exists because it's
 * easy to mask the happy path and forget the error path still dumps the raw payload — see the
 * error handlers in {@link RoutingEventListener} that used to log the full event JSON (accounts
 * included) on parse failure.
 */
public final class PiiMasking {

    private PiiMasking() {
    }

    /** e.g. "ACC-001" -> "AC***01" — enough to correlate in logs without exposing the full number. */
    public static String maskAccount(String accountId) {
        if (accountId == null || accountId.length() <= 4) {
            return "****";
        }
        return accountId.substring(0, 2) + "***" + accountId.substring(accountId.length() - 2);
    }
}
