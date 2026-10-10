package com.ewalletlab.bnplservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

/**
 * One statement cycle = one calendar month (Vietnam time) of draws, due on day 1 of the NEXT month
 * — momo.vn/vi-tra-sau says "đầu tháng tiếp theo" with no specific day, so day 1 is the earliest
 * reading of that, not an invented date.
 *
 * <p>Only what's been <i>paid</i> is stored. The late fee owed is never stored: it's recomputed
 * from "now" on every read/repayment (see {@code BnplCalculator}), so the tier always matches the
 * real number of days late at that moment.
 */
@Entity
@Table(name = "statements", uniqueConstraints = @UniqueConstraint(columnNames = {"credit_line_id", "period"}))
public class Statement {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "credit_line_id", nullable = false)
    private UUID creditLineId;

    /** "YYYY-MM". */
    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal principal = BigDecimal.ZERO;

    @Column(name = "principal_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal principalPaid = BigDecimal.ZERO;

    @Column(name = "service_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal serviceFee = BigDecimal.ZERO;

    @Column(name = "service_fee_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal serviceFeePaid = BigDecimal.ZERO;

    @Column(name = "late_fee_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal lateFeePaid = BigDecimal.ZERO;

    protected Statement() {
        // JPA
    }

    public Statement(UUID creditLineId, YearMonth period, BigDecimal serviceFee) {
        this.creditLineId = creditLineId;
        this.period = period.toString();
        this.dueDate = period.plusMonths(1).atDay(1);
        this.serviceFee = serviceFee;
    }

    public void addPrincipal(BigDecimal amount) {
        principal = principal.add(amount);
    }

    public void subtractPrincipal(BigDecimal amount) {
        principal = principal.subtract(amount);
    }

    /** Applies (positive) or reverts (negative) one repayment's allocation to this statement. */
    public void applyPayment(BigDecimal lateFee, BigDecimal fee, BigDecimal principalPart) {
        lateFeePaid = lateFeePaid.add(lateFee);
        serviceFeePaid = serviceFeePaid.add(fee);
        principalPaid = principalPaid.add(principalPart);
    }

    public BigDecimal getUnpaidPrincipal() {
        return principal.subtract(principalPaid);
    }

    public BigDecimal getUnpaidServiceFee() {
        return serviceFee.subtract(serviceFeePaid);
    }

    public UUID getId() { return id; }
    public UUID getCreditLineId() { return creditLineId; }
    public String getPeriod() { return period; }
    public LocalDate getDueDate() { return dueDate; }
    public BigDecimal getPrincipal() { return principal; }
    public BigDecimal getPrincipalPaid() { return principalPaid; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public BigDecimal getServiceFeePaid() { return serviceFeePaid; }
    public BigDecimal getLateFeePaid() { return lateFeePaid; }
}
