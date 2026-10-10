package com.ewalletlab.bnplservice.service;

import com.ewalletlab.bnplservice.config.BnplProperties;
import com.ewalletlab.bnplservice.domain.*;
import com.ewalletlab.bnplservice.repository.CreditLineRepository;
import com.ewalletlab.bnplservice.repository.DrawRepository;
import com.ewalletlab.bnplservice.repository.RepaymentRepository;
import com.ewalletlab.bnplservice.repository.StatementRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * The {@code @Transactional} steps, in a bean separate from {@link BnplService} so each step is its
 * own transaction across a proxy boundary — same split as LuckyMoneyMutationExecutor /
 * PaymentRequestMutationExecutor.
 *
 * <p><b>"Claim state first, move money after"</b> (mandatory per issue #18 / lessons of #3/#8/#10):
 * {@link #claimRepayment} reduces the debt and records a PENDING repayment, under a row lock on the
 * credit line, and commits BEFORE wallet-service is called. A concurrent repayment therefore
 * re-reads an already-reduced debt and can never be allowed to pay the same đồng twice. If the
 * wallet debit then fails, {@link #revertRepayment} gives back exactly the claimed allocation.
 */
@Component
class BnplMutationExecutor {

    private final CreditLineRepository creditLines;
    private final StatementRepository statements;
    private final DrawRepository draws;
    private final RepaymentRepository repayments;
    private final BnplCalculator calculator;
    private final BnplProperties props;
    private final Clock clock;

    BnplMutationExecutor(CreditLineRepository creditLines, StatementRepository statements, DrawRepository draws,
                         RepaymentRepository repayments, BnplCalculator calculator, BnplProperties props, Clock clock) {
        this.creditLines = creditLines;
        this.statements = statements;
        this.draws = draws;
        this.repayments = repayments;
        this.calculator = calculator;
        this.props = props;
        this.clock = clock;
    }

    @Transactional
    CreditLine open(UUID userId) {
        if (creditLines.findByUserId(userId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ví Trả Sau (mô phỏng) đã được mở cho tài khoản này");
        }
        try {
            return creditLines.saveAndFlush(new CreditLine(userId, props.creditLimit(), Instant.now(clock)));
        } catch (DataIntegrityViolationException e) {
            // Concurrent open() for the same user lost the unique(user_id) race.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ví Trả Sau (mô phỏng) đã được mở cho tài khoản này");
        }
    }

    /** Purely local (no external call), serialized by the credit-line row lock. */
    @Transactional
    Draw draw(UUID userId, BigDecimal amount, String label) {
        CreditLine line = lockOrThrow(userId);
        if (amount.compareTo(line.getAvailableLimit()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Vượt hạn mức khả dụng của Ví Trả Sau (còn " + Money.vnd(line.getAvailableLimit()) + ")");
        }
        YearMonth period = YearMonth.now(clock);
        // First draw of a calendar month opens that month's statement AND charges its 33.000đ
        // service fee — "chỉ tính tháng có phát sinh giao dịch".
        Statement statement = statements.findByCreditLineIdAndPeriod(line.getId(), period.toString())
            .orElseGet(() -> statements.save(new Statement(line.getId(), period, props.monthlyServiceFee())));
        statement.addPrincipal(amount);
        line.addPrincipal(amount);
        return draws.save(new Draw(line.getId(), statement.getId(), amount, label, Instant.now(clock)));
    }

    /** Compensation: bill-payment failed after draw — refund drawn amount. */
    @Transactional
    void refund(UUID userId, BigDecimal amount, String reason) {
        CreditLine line = lockOrThrow(userId);
        YearMonth period = YearMonth.now(clock);
        Statement statement = statements.findByCreditLineIdAndPeriod(line.getId(), period.toString())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy kỳ sao kê"));
        statement.subtractPrincipal(amount);
        line.subtractPrincipal(amount);
        draws.save(new Draw(line.getId(), statement.getId(), amount.negate(),
            reason == null || reason.isBlank() ? "Hoàn trả hạn mức" : reason.strip(), Instant.now(clock)));
    }

    @Transactional
    Repayment claimRepayment(UUID userId, BigDecimal amount) {
        CreditLine line = lockOrThrow(userId);
        LocalDate today = LocalDate.now(clock);
        List<Statement> open = statements.findByCreditLineIdOrderByPeriodAsc(line.getId());
        BigDecimal totalDue = calculator.totalDue(open, today);
        if (totalDue.signum() == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ví Trả Sau không còn dư nợ");
        }
        if (amount.compareTo(totalDue) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Số tiền trả vượt quá tổng dư nợ hiện tại (" + Money.vnd(totalDue) + ")");
        }
        List<RepaymentAllocation> allocations = calculator.allocate(open, amount, today);
        apply(line, open, allocations, BigDecimal.ONE);
        return repayments.save(new Repayment(line.getId(), amount, allocations, Instant.now(clock)));
    }

    @Transactional
    void completeRepayment(UUID repaymentId) {
        repayments.findById(repaymentId).ifPresent(Repayment::markCompleted);
    }

    /** Compensation: wallet-service did not debit — give the claimed debt reduction back. */
    @Transactional
    void revertRepayment(UUID userId, UUID repaymentId) {
        CreditLine line = lockOrThrow(userId);
        Repayment repayment = repayments.findById(repaymentId).orElseThrow();
        if (repayment.getStatus() != RepaymentStatus.PENDING) {
            return;
        }
        apply(line, statements.findByCreditLineIdOrderByPeriodAsc(line.getId()), repayment.getAllocations(),
            BigDecimal.ONE.negate());
        repayment.markFailed();
    }

    private void apply(CreditLine line, List<Statement> all, List<RepaymentAllocation> allocations, BigDecimal sign) {
        Map<UUID, Statement> byId = new HashMap<>();
        all.forEach(s -> byId.put(s.getId(), s));
        for (RepaymentAllocation a : allocations) {
            Statement s = byId.get(a.getStatementId());
            s.applyPayment(a.getLateFee().multiply(sign), a.getServiceFee().multiply(sign), a.getPrincipal().multiply(sign));
            line.subtractPrincipal(a.getPrincipal().multiply(sign));
        }
    }

    private CreditLine lockOrThrow(UUID userId) {
        return creditLines.lockByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa mở Ví Trả Sau"));
    }
}
