package com.ewalletlab.bnplservice.web.dto;

import com.ewalletlab.bnplservice.domain.Draw;
import com.ewalletlab.bnplservice.domain.Repayment;
import com.ewalletlab.bnplservice.domain.RepaymentStatus;
import com.ewalletlab.bnplservice.service.BnplCalculator;
import com.ewalletlab.bnplservice.service.BnplService;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record BnplWalletDto(
    boolean opened,
    BigDecimal creditLimit,
    BigDecimal availableLimit,
    BigDecimal outstandingPrincipal,
    BigDecimal totalDue,
    /** Earliest due date among statements that still owe something, or null. */
    LocalDate nextDueDate,
    boolean overdue,
    /** The service's "today" (Vietnam time, including any test clock offset). */
    LocalDate today,
    Instant disclaimerAcceptedAt,
    List<StatementDto> statements,
    List<DrawDto> draws,
    List<RepaymentDto> repayments
) {
    public enum StatementStatus { NOT_DUE, OVERDUE, SETTLED }

    public record StatementDto(
        String period, LocalDate dueDate, BigDecimal principal, BigDecimal principalPaid,
        BigDecimal serviceFee, BigDecimal serviceFeePaid, BigDecimal lateFeePaid,
        long daysLate, BigDecimal lateFeeRate, BigDecimal lateFeeDue, BigDecimal totalDue, StatementStatus status) {

        static StatementDto from(BnplCalculator.StatementDue d) {
            var s = d.statement();
            StatementStatus status = d.totalDue().signum() == 0 ? StatementStatus.SETTLED
                : d.daysLate() > 0 ? StatementStatus.OVERDUE : StatementStatus.NOT_DUE;
            return new StatementDto(s.getPeriod(), s.getDueDate(), s.getPrincipal(), s.getPrincipalPaid(),
                s.getServiceFee(), s.getServiceFeePaid(), s.getLateFeePaid(),
                d.daysLate(), d.lateFeeRate(), d.lateFeeDue(), d.totalDue(), status);
        }
    }

    public record DrawDto(UUID id, String period, BigDecimal amount, String label, Instant createdAt) {
    }

    public record RepaymentDto(UUID id, BigDecimal amount, RepaymentStatus status, Instant createdAt) {
        static RepaymentDto from(Repayment r) {
            return new RepaymentDto(r.getId(), r.getAmount(), r.getStatus(), r.getCreatedAt());
        }
    }

    public static BnplWalletDto notOpened() {
        return new BnplWalletDto(false, null, null, null, null, null, false, null, null, List.of(), List.of(), List.of());
    }

    public static BnplWalletDto from(BnplService.Snapshot snap) {
        var line = snap.creditLine();
        List<StatementDto> statements = snap.statements().stream().map(StatementDto::from).toList();
        var periodById = new java.util.HashMap<UUID, String>();
        snap.statements().forEach(d -> periodById.put(d.statement().getId(), d.statement().getPeriod()));
        LocalDate nextDue = statements.stream().filter(s -> s.status() != StatementStatus.SETTLED)
            .map(StatementDto::dueDate).min(LocalDate::compareTo).orElse(null);
        boolean overdue = statements.stream().anyMatch(s -> s.status() == StatementStatus.OVERDUE);
        List<DrawDto> draws = snap.draws().stream()
            .map((Draw d) -> new DrawDto(d.getId(), periodById.get(d.getStatementId()), d.getAmount(), d.getLabel(), d.getCreatedAt()))
            .toList();
        return new BnplWalletDto(true, line.getCreditLimit(), line.getAvailableLimit(), line.getOutstandingPrincipal(),
            snap.totalDue(), nextDue, overdue, snap.today(), line.getDisclaimerAcceptedAt(), statements, draws,
            snap.repayments().stream().map(RepaymentDto::from).toList());
    }
}
