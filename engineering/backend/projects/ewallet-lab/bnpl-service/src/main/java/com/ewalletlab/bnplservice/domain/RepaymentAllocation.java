package com.ewalletlab.bnplservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.math.BigDecimal;
import java.util.UUID;

/** How much of one repayment went to one statement, split by bucket — kept so a failed wallet
 * debit can revert exactly what was claimed. */
@Embeddable
public class RepaymentAllocation {

    @Column(name = "statement_id", nullable = false)
    private UUID statementId;

    @Column(name = "late_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal lateFee;

    @Column(name = "service_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal serviceFee;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal principal;

    protected RepaymentAllocation() {
        // JPA
    }

    public RepaymentAllocation(UUID statementId, BigDecimal lateFee, BigDecimal serviceFee, BigDecimal principal) {
        this.statementId = statementId;
        this.lateFee = lateFee;
        this.serviceFee = serviceFee;
        this.principal = principal;
    }

    public UUID getStatementId() { return statementId; }
    public BigDecimal getLateFee() { return lateFee; }
    public BigDecimal getServiceFee() { return serviceFee; }
    public BigDecimal getPrincipal() { return principal; }
}
