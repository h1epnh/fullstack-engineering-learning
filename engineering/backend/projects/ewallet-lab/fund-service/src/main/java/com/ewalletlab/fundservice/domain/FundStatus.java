package com.ewalletlab.fundservice.domain;

/** Issue #14 — a fund is either taking contributions/allowing withdrawals (ACTIVE), or has been
 * fully closed out by its creator (DISSOLVED — see Fund's javadoc on {@code dissolve}). There is no
 * "paused" state in this MVP. */
public enum FundStatus {
    ACTIVE,
    DISSOLVED
}
