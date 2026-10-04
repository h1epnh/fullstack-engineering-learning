package com.ewalletlab.bnplservice.service;

import com.ewalletlab.bnplservice.config.BnplProperties;
import com.ewalletlab.bnplservice.domain.RepaymentAllocation;
import com.ewalletlab.bnplservice.domain.Statement;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Pure money math for issue #18 — no I/O, so it's unit-testable on its own.
 *
 * <p><b>Late fee model</b> (the issue leaves the exact mechanics to agent-dev as long as it's
 * always recomputed from "now"): for a statement past its due date,
 * <pre>
 *   base       = unpaid principal + unpaid service fee
 *   lateFeeDue = max(0, round(tierRate(daysLate) × base) − lateFeePaid)
 * </pre>
 * i.e. the late fee is the tier percentage of what's still outstanding <i>at this moment</i>, and
 * whatever has already been paid towards late fees on that statement counts against it. Nothing
 * is "frozen": crossing into the next tier raises it, paying down the base lowers it.
 *
 * <p><b>Allocation order</b> of a repayment: oldest statement first; within a statement late fee →
 * service fee → principal. Because the late fee is always cleared before the base can shrink,
 * paying a statement off completely can never "erase" an unpaid late fee.
 *
 * <p>VND has no minor unit — every computed amount is rounded HALF_UP to whole đồng.
 */
@Component
public class BnplCalculator {

    private final BnplProperties props;

    public BnplCalculator(BnplProperties props) {
        this.props = props;
    }

    public record StatementDue(
        Statement statement, long daysLate, BigDecimal lateFeeRate, BigDecimal lateFeeDue, BigDecimal totalDue) {
    }

    /** 0 on or before the due date (paying on day 1 itself is on time). */
    public long daysLate(Statement s, LocalDate today) {
        return Math.max(0, ChronoUnit.DAYS.between(s.getDueDate(), today));
    }

    public BigDecimal lateFeeRate(long daysLate) {
        return props.lateFeeTiers().stream()
            .filter(t -> daysLate >= t.fromDay())
            .max(Comparator.comparingInt(BnplProperties.LateFeeTier::fromDay))
            .map(BnplProperties.LateFeeTier::rate)
            .orElse(BigDecimal.ZERO);
    }

    public StatementDue due(Statement s, LocalDate today) {
        BigDecimal base = s.getUnpaidPrincipal().add(s.getUnpaidServiceFee());
        long daysLate = daysLate(s, today);
        BigDecimal rate = lateFeeRate(daysLate);
        BigDecimal lateFeeDue = rate.multiply(base).setScale(0, RoundingMode.HALF_UP)
            .subtract(s.getLateFeePaid()).max(BigDecimal.ZERO);
        return new StatementDue(s, daysLate, rate, lateFeeDue, base.add(lateFeeDue));
    }

    public BigDecimal totalDue(List<Statement> statements, LocalDate today) {
        return statements.stream().map(s -> due(s, today).totalDue()).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Splits {@code amount} across {@code statementsOldestFirst}. Caller must already have checked
     * {@code amount <= totalDue}; any remainder would be a bug, so it throws.
     */
    public List<RepaymentAllocation> allocate(List<Statement> statementsOldestFirst, BigDecimal amount, LocalDate today) {
        List<RepaymentAllocation> result = new ArrayList<>();
        BigDecimal left = amount;
        for (Statement s : statementsOldestFirst) {
            if (left.signum() <= 0) {
                break;
            }
            StatementDue d = due(s, today);
            BigDecimal late = left.min(d.lateFeeDue());
            left = left.subtract(late);
            BigDecimal fee = left.min(s.getUnpaidServiceFee());
            left = left.subtract(fee);
            BigDecimal principal = left.min(s.getUnpaidPrincipal());
            left = left.subtract(principal);
            if (late.signum() > 0 || fee.signum() > 0 || principal.signum() > 0) {
                result.add(new RepaymentAllocation(s.getId(), late, fee, principal));
            }
        }
        if (left.signum() != 0) {
            throw new IllegalStateException("Repayment amount exceeds total due by " + left);
        }
        return result;
    }
}
