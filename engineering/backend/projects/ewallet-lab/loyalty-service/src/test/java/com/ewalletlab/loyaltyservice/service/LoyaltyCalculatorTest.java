package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LoyaltyCalculatorTest {

    private static LoyaltyProperties.Tier tier(String name, String min, String mult) {
        return new LoyaltyProperties.Tier(name, new BigDecimal(min), new BigDecimal(mult));
    }

    private final LoyaltyCalculator calc = new LoyaltyCalculator(new LoyaltyProperties(
        new BigDecimal("10000"), new BigDecimal("100"), 100, 12,
        // deliberately unsorted — calculator must sort by minSpend
        List.of(tier("Ưu tiên", "20000000", "1.5"), tier("Thành viên", "0", "1.0"),
            tier("Đặc biệt", "50000000", "2.0"), tier("Thân thiết", "5000000", "1.2")),
        ZoneId.of("Asia/Ho_Chi_Minh")));

    @Test
    void tierBoundariesAreInclusive() {
        assertThat(calc.tierFor(new BigDecimal("0")).name()).isEqualTo("Thành viên");
        assertThat(calc.tierFor(new BigDecimal("4999999")).name()).isEqualTo("Thành viên");
        assertThat(calc.tierFor(new BigDecimal("5000000")).name()).isEqualTo("Thân thiết");
        assertThat(calc.tierFor(new BigDecimal("20000000")).name()).isEqualTo("Ưu tiên");
        assertThat(calc.tierFor(new BigDecimal("999000000")).name()).isEqualTo("Đặc biệt");
    }

    @Test
    void nextTier() {
        assertThat(calc.nextTier(calc.tierFor(BigDecimal.ZERO)).orElseThrow().name()).isEqualTo("Thân thiết");
        assertThat(calc.nextTier(calc.tierFor(new BigDecimal("60000000")))).isEmpty();
    }

    @Test
    void pointsAreFlooredAndMultiplied() {
        var base = calc.tierFor(BigDecimal.ZERO);
        assertThat(calc.pointsFor(new BigDecimal("9999"), base)).isZero();
        assertThat(calc.pointsFor(new BigDecimal("125000"), base)).isEqualTo(12);
        assertThat(calc.pointsFor(new BigDecimal("125000"), calc.tierFor(new BigDecimal("20000000")))).isEqualTo(18); // 18.75
        assertThat(calc.pointsFor(new BigDecimal("125000"), calc.tierFor(new BigDecimal("50000000")))).isEqualTo(25);
    }

    @Test
    void cashbackIsPointsTimesValue() {
        assertThat(calc.cashbackFor(150)).isEqualByComparingTo("15000");
    }
}
