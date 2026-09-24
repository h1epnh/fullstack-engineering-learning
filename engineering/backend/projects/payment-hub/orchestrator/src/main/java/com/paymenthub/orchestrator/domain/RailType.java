package com.paymenthub.orchestrator.domain;

/**
 * Which external payment rail a transaction is routed to.
 * INTERNAL = same-bank transfer, settled purely in the internal ledger, no external rail involved.
 * VISA/MASTERCARD = card network rails, detected from a card PAN in destAccount (see
 * RoutingEngine) rather than a bank account number — a structurally different kind of "account".
 * MOMO/ZALOPAY = specific Vietnamese e-wallet providers, detected from a VN phone number in
 * destAccount PLUS an explicit walletProvider — a phone number alone doesn't say which wallet app
 * it's registered with (a user can have both), unlike a card PAN's BIN which is unambiguous. See
 * RoutingEngine.
 */
public enum RailType {
    INTERNAL,
    NAPAS,
    SWIFT,
    VISA,
    MASTERCARD,
    MOMO,
    ZALOPAY
}
