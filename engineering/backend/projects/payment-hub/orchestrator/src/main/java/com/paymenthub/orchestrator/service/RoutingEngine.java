package com.paymenthub.orchestrator.service;

import com.paymenthub.orchestrator.domain.RailType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.regex.Pattern;

/**
 * Decides which rail a transaction goes through, based on the SHAPE of destAccount — it isn't
 * always a bank account number:
 * - a card PAN (Primary Account Number) -> VISA or MASTERCARD, detected by BIN range (ISO/IEC
 *   7812), same technique real acquirers use for network routing
 * - a VN phone number -> MOMO or ZALOPAY, but the phone number alone is ambiguous (a person can
 *   have both wallets on the same number) — the caller must say which via walletProvider
 * - otherwise, a bank account number -> NAPAS/SWIFT per the BIC/currency/amount rules below
 *
 * See DESIGN.md section 3 and BUSINESS.md for the full picture (why this order, what's simplified).
 *
 * {@link RailType#INTERNAL} (same-bank, ledger-only) is intentionally not reachable here yet —
 * that needs comparing the beneficiary's bank code against this bank's own BIN, which this lab
 * scaffold doesn't model. Left as a TODO rather than faked.
 */
@Component
public class RoutingEngine {

    private static final String VND = "VND";

    /**
     * NAPAS clears domestic interbank transfers under 500,000,000 VND; higher-value VND transfers
     * go through the State Bank of Vietnam's own IBPS (Interbank Payment System), a separate
     * settlement system this lab does not model. This is a real regulatory/operational ceiling,
     * not an arbitrary lab constraint — see BUSINESS.md "NAPAS vs IBPS".
     */
    static final BigDecimal NAPAS_CEILING_VND = new BigDecimal("500000000");

    // ISO/IEC 7812 BIN ranges. Visa: starts with 4. Mastercard: 51-55, plus the 2221-2720 range
    // added in 2016/2017 once the 51-55 range ran low on available numbers.
    private static final Pattern VISA_PAN = Pattern.compile("^4\\d{12,18}$");
    private static final Pattern MASTERCARD_PAN_LEGACY = Pattern.compile("^5[1-5]\\d{14}$");
    private static final Pattern MASTERCARD_PAN_EXTENDED =
        Pattern.compile("^(222[1-9]|22[3-9]\\d|2[3-6]\\d{2}|27[01]\\d|2720)\\d{12}$");

    // VN mobile numbers: 10 digits starting with 0 (post-2018 unified numbering plan).
    private static final Pattern VN_PHONE = Pattern.compile("^0\\d{9}$");

    public RailType route(String destAccount, String destBic, String currency, BigDecimal amount,
                           String walletProvider) {
        if (VISA_PAN.matcher(destAccount).matches()) {
            return RailType.VISA;
        }
        if (MASTERCARD_PAN_LEGACY.matcher(destAccount).matches()
            || MASTERCARD_PAN_EXTENDED.matcher(destAccount).matches()) {
            return RailType.MASTERCARD;
        }
        if (VN_PHONE.matcher(destAccount).matches()) {
            return routeWallet(walletProvider);
        }

        boolean hasBic = StringUtils.hasText(destBic);
        boolean isVnd = VND.equalsIgnoreCase(currency);

        if (hasBic && !isVnd) {
            return RailType.SWIFT;
        }
        if (isVnd) {
            if (amount.compareTo(NAPAS_CEILING_VND) >= 0) {
                throw new IllegalArgumentException(
                    "Cannot route: VND amount " + amount.toPlainString() + " is at or above the NAPAS ceiling ("
                        + NAPAS_CEILING_VND.toPlainString()
                        + ") — must clear via SBV's IBPS system, not modeled in this lab");
            }
            return RailType.NAPAS;
        }
        // Non-VND with no BIC is not a valid routable transaction in this lab's simplified model.
        throw new IllegalArgumentException(
            "Cannot route: non-VND currency requires a destination BIC (cross-border via SWIFT)");
    }

    /**
     * destAccount being a phone number only tells us "this is an e-wallet transfer" — it does NOT
     * tell us which wallet, since the same phone number can be registered with both Momo and
     * ZaloPay independently. A real payment hub either takes an explicit provider selection (what
     * this does) or queries a wallet-lookup service to find out which provider(s) that number has
     * an active wallet on — the second option isn't modeled in this lab.
     */
    private RailType routeWallet(String walletProvider) {
        if (!StringUtils.hasText(walletProvider)) {
            throw new IllegalArgumentException(
                "Cannot route: destAccount looks like a VN phone number (e-wallet transfer) but no "
                    + "walletProvider was given — a phone number alone doesn't identify which wallet "
                    + "(MOMO or ZALOPAY) to use");
        }
        return switch (walletProvider.toUpperCase()) {
            case "MOMO" -> RailType.MOMO;
            case "ZALOPAY" -> RailType.ZALOPAY;
            default -> throw new IllegalArgumentException(
                "Cannot route: unsupported walletProvider \"" + walletProvider + "\" — only MOMO and ZALOPAY are integrated");
        };
    }
}
