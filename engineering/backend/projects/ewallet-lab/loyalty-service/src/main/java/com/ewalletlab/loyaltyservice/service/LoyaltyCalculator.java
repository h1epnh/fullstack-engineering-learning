package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/** Pure point/tier math for issue #19 — no I/O. */
@Component
public class LoyaltyCalculator {

    /**
     * Only bill payments earn points. P2P transfers (TRANSFER_OUT), withdrawals and top-ups are
     * excluded on purpose: two accounts passing money back and forth (or top-up → withdraw loops)
     * would otherwise farm unlimited points and then redeem them as real cashback — money created
     * from nothing. A bill payment leaves the lab's wallets for a (mock) biller and can't be cycled.
     */
    public static final Set<String> ELIGIBLE_TYPES = Set.of("BILL_PAYMENT");

    private final LoyaltyProperties props;

    public LoyaltyCalculator(LoyaltyProperties props) {
        this.props = props;
    }

    public List<LoyaltyProperties.Tier> tiersAscending() {
        return props.tiers().stream().sorted(Comparator.comparing(LoyaltyProperties.Tier::minSpend)).toList();
    }

    public LoyaltyProperties.Tier tierFor(BigDecimal qualifyingSpend) {
        LoyaltyProperties.Tier current = tiersAscending().get(0);
        for (LoyaltyProperties.Tier t : tiersAscending()) {
            if (qualifyingSpend.compareTo(t.minSpend()) >= 0) {
                current = t;
            }
        }
        return current;
    }

    public Optional<LoyaltyProperties.Tier> nextTier(LoyaltyProperties.Tier current) {
        return tiersAscending().stream().filter(t -> t.minSpend().compareTo(current.minSpend()) > 0).findFirst();
    }

    /** floor(amount × multiplier / spendPerPoint) — partial points are never rounded up. */
    public long pointsFor(BigDecimal amount, LoyaltyProperties.Tier tier) {
        return amount.multiply(tier.multiplier()).divide(props.spendPerPoint(), 0, RoundingMode.FLOOR).longValueExact();
    }

    public BigDecimal cashbackFor(long points) {
        return props.pointValueVnd().multiply(BigDecimal.valueOf(points));
    }

    /** Start of the rolling tier window (e.g. now − 12 months). */
    public Instant windowStart(ZonedDateTime now) {
        return now.minusMonths(props.tierWindowMonths()).toInstant();
    }

    public long minRedeemPoints() {
        return props.minRedeemPoints();
    }

    public int tierWindowMonths() {
        return props.tierWindowMonths();
    }

    public BigDecimal pointValueVnd() {
        return props.pointValueVnd();
    }

    public BigDecimal spendPerPoint() {
        return props.spendPerPoint();
    }
}
