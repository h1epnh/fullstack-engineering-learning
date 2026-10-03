package com.ewalletlab.bnplservice.service;

import com.ewalletlab.bnplservice.config.BnplProperties;
import com.ewalletlab.bnplservice.domain.RepaymentAllocation;
import com.ewalletlab.bnplservice.domain.Statement;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BnplCalculatorTest {

    private static final BnplProperties PROPS = new BnplProperties(
        new BigDecimal("20000000"), new BigDecimal("33000"),
        List.of(tier(1, "0.0525"), tier(5, "0.105"), tier(10, "0.1575"), tier(15, "0.21")),
        ZoneId.of("Asia/Ho_Chi_Minh"), 0);

    private final BnplCalculator calc = new BnplCalculator(PROPS);

    private static BnplProperties.LateFeeTier tier(int day, String rate) {
        return new BnplProperties.LateFeeTier(day, new BigDecimal(rate));
    }

    private static Statement statement(String period, String principal) {
        Statement s = new Statement(UUID.randomUUID(), YearMonth.parse(period), new BigDecimal("33000"));
        s.addPrincipal(new BigDecimal(principal));
        ReflectionTestUtils.setField(s, "id", UUID.randomUUID());
        return s;
    }

    @Test
    void dueDateIsFirstDayOfNextMonth() {
        assertThat(statement("2026-12", "1000").getDueDate()).isEqualTo(LocalDate.of(2027, 1, 1));
    }

    @Test
    void tiersFollowDaysLate() {
        assertThat(calc.lateFeeRate(0)).isEqualByComparingTo("0");
        assertThat(calc.lateFeeRate(1)).isEqualByComparingTo("0.0525");
        assertThat(calc.lateFeeRate(4)).isEqualByComparingTo("0.0525");
        assertThat(calc.lateFeeRate(5)).isEqualByComparingTo("0.105");
        assertThat(calc.lateFeeRate(9)).isEqualByComparingTo("0.105");
        assertThat(calc.lateFeeRate(10)).isEqualByComparingTo("0.1575");
        assertThat(calc.lateFeeRate(14)).isEqualByComparingTo("0.1575");
        assertThat(calc.lateFeeRate(15)).isEqualByComparingTo("0.21");
        assertThat(calc.lateFeeRate(400)).isEqualByComparingTo("0.21");
    }

    @Test
    void onTimeOnDueDateItself() {
        Statement s = statement("2026-10", "1000000");
        var d = calc.due(s, LocalDate.of(2026, 11, 1));
        assertThat(d.daysLate()).isZero();
        assertThat(d.totalDue()).isEqualByComparingTo("1033000");
    }

    @Test
    void lateFeeIsRecomputedFromNow() {
        Statement s = statement("2026-10", "1000000");
        // base 1.033.000 — day 2 late: 5,25% = 54.232,5 → 54.233
        assertThat(calc.due(s, LocalDate.of(2026, 11, 3)).lateFeeDue()).isEqualByComparingTo("54233");
        // day 16 late: 21% = 216.930
        assertThat(calc.due(s, LocalDate.of(2026, 11, 17)).lateFeeDue()).isEqualByComparingTo("216930");
    }

    @Test
    void allocationPaysLateFeeThenServiceFeeThenPrincipalOldestFirst() {
        Statement oct = statement("2026-10", "1000000");
        Statement nov = statement("2026-11", "500000");
        LocalDate today = LocalDate.of(2026, 11, 3); // oct 2 days late, nov not due
        List<RepaymentAllocation> a = calc.allocate(List.of(oct, nov), new BigDecimal("1100000"), today);

        assertThat(a).hasSize(2);
        assertThat(a.get(0).getLateFee()).isEqualByComparingTo("54233");
        assertThat(a.get(0).getServiceFee()).isEqualByComparingTo("33000");
        assertThat(a.get(0).getPrincipal()).isEqualByComparingTo("1000000");
        // remaining 12.767 → nov's service fee first
        assertThat(a.get(1).getLateFee()).isEqualByComparingTo("0");
        assertThat(a.get(1).getServiceFee()).isEqualByComparingTo("12767");
        assertThat(a.get(1).getPrincipal()).isEqualByComparingTo("0");
    }

    @Test
    void partialLateFeePaymentIsCreditedAndNextTierChargesOnlyTheDifference() {
        Statement s = statement("2026-10", "1000000");
        LocalDate day2 = LocalDate.of(2026, 11, 3);
        RepaymentAllocation a = calc.allocate(List.of(s), new BigDecimal("54233"), day2).get(0);
        s.applyPayment(a.getLateFee(), a.getServiceFee(), a.getPrincipal());
        assertThat(calc.due(s, day2).lateFeeDue()).isEqualByComparingTo("0");

        // day 6 late: 10,5% × 1.033.000 = 108.465, minus 54.233 already paid
        assertThat(calc.due(s, LocalDate.of(2026, 11, 7)).lateFeeDue()).isEqualByComparingTo("54232");
    }

    @Test
    void overAllocationIsABug() {
        Statement s = statement("2026-10", "1000");
        assertThatThrownBy(() -> calc.allocate(List.of(s), new BigDecimal("999999"), LocalDate.of(2026, 10, 15)))
            .isInstanceOf(IllegalStateException.class);
    }
}
