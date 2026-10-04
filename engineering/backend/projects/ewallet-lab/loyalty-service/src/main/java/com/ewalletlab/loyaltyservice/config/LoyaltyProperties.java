package com.ewalletlab.loyaltyservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;

/** Binds {@code ewallet-lab.loyalty.*} — see application.yml for what each number means. */
@ConfigurationProperties(prefix = "ewallet-lab.loyalty")
public record LoyaltyProperties(
    BigDecimal spendPerPoint,
    BigDecimal pointValueVnd,
    long minRedeemPoints,
    int tierWindowMonths,
    List<Tier> tiers,
    ZoneId zone
) {
    public record Tier(String name, BigDecimal minSpend, BigDecimal multiplier) {
    }
}
