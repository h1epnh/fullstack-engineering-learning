package com.ewalletlab.loyaltyservice.web.dto;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import com.ewalletlab.loyaltyservice.domain.PointEntry;
import com.ewalletlab.loyaltyservice.domain.PointEntryKind;
import com.ewalletlab.loyaltyservice.domain.PointEntryStatus;
import com.ewalletlab.loyaltyservice.service.LoyaltyCalculator;
import com.ewalletlab.loyaltyservice.service.LoyaltyService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record LoyaltyDto(
    long pointsBalance,
    long lifetimeEarned,
    BigDecimal pointsValueVnd,
    String tier,
    BigDecimal tierMultiplier,
    BigDecimal qualifyingSpend,
    int tierWindowMonths,
    String nextTier,
    BigDecimal nextTierMinSpend,
    BigDecimal spendPerPoint,
    BigDecimal pointValueVnd,
    long minRedeemPoints,
    Instant enrolledAt,
    boolean synced,
    List<TierDto> tiers,
    List<EntryDto> history
) {
    public record TierDto(String name, BigDecimal minSpend, BigDecimal multiplier) {
    }

    public record EntryDto(UUID id, PointEntryKind kind, long points, BigDecimal amountVnd, String tier,
                           PointEntryStatus status, Instant createdAt) {
        static EntryDto from(PointEntry e) {
            return new EntryDto(e.getId(), e.getKind(), e.getPoints(), e.getAmountVnd(), e.getTier(), e.getStatus(), e.getCreatedAt());
        }
    }

    public static LoyaltyDto from(LoyaltyService.Snapshot s, LoyaltyCalculator calc) {
        var a = s.account();
        return new LoyaltyDto(
            a.getPointsBalance(), a.getLifetimeEarned(), calc.cashbackFor(a.getPointsBalance()),
            s.tier().name(), s.tier().multiplier(), s.qualifyingSpend(), calc.tierWindowMonths(),
            s.nextTier().map(LoyaltyProperties.Tier::name).orElse(null),
            s.nextTier().map(LoyaltyProperties.Tier::minSpend).orElse(null),
            calc.spendPerPoint(), calc.pointValueVnd(), calc.minRedeemPoints(), a.getEnrolledAt(), s.synced(),
            calc.tiersAscending().stream().map(t -> new TierDto(t.name(), t.minSpend(), t.multiplier())).toList(),
            s.history().stream().map(EntryDto::from).toList());
    }
}
