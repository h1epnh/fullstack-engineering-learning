package com.ewalletlab.bnplservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;

/** Binds {@code ewallet-lab.bnpl.*} — see application.yml for the source of every number. */
@ConfigurationProperties(prefix = "ewallet-lab.bnpl")
public record BnplProperties(
    BigDecimal creditLimit,
    BigDecimal monthlyServiceFee,
    List<LateFeeTier> lateFeeTiers,
    ZoneId zone,
    long clockOffsetDays
) {
    public record LateFeeTier(int fromDay, BigDecimal rate) {
    }
}
