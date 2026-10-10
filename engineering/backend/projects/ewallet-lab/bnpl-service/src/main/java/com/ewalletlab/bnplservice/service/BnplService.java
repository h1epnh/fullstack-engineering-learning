package com.ewalletlab.bnplservice.service;

import com.ewalletlab.bnplservice.domain.CreditLine;
import com.ewalletlab.bnplservice.domain.Draw;
import com.ewalletlab.bnplservice.domain.Repayment;
import com.ewalletlab.bnplservice.domain.Statement;
import com.ewalletlab.bnplservice.repository.CreditLineRepository;
import com.ewalletlab.bnplservice.repository.DrawRepository;
import com.ewalletlab.bnplservice.repository.RepaymentRepository;
import com.ewalletlab.bnplservice.repository.StatementRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Issue #18 — "Ví Trả Sau" MOCK credit line. Learning simulation only: not a real lending product,
 * no real bank/finance company behind it (see DESIGN.md's disclaimer).
 */
@Service
public class BnplService {

    private final CreditLineRepository creditLines;
    private final StatementRepository statements;
    private final DrawRepository draws;
    private final RepaymentRepository repayments;
    private final BnplMutationExecutor executor;
    private final BnplCalculator calculator;
    private final WalletServiceClient walletServiceClient;
    private final Clock clock;

    public BnplService(CreditLineRepository creditLines, StatementRepository statements, DrawRepository draws,
                       RepaymentRepository repayments, BnplMutationExecutor executor, BnplCalculator calculator,
                       WalletServiceClient walletServiceClient, Clock clock) {
        this.creditLines = creditLines;
        this.statements = statements;
        this.draws = draws;
        this.repayments = repayments;
        this.executor = executor;
        this.calculator = calculator;
        this.walletServiceClient = walletServiceClient;
        this.clock = clock;
    }

    public record Snapshot(
        CreditLine creditLine, List<BnplCalculator.StatementDue> statements, BigDecimal totalDue,
        List<Draw> draws, List<Repayment> repayments, LocalDate today) {
    }

    public Optional<Snapshot> get(UUID userId) {
        return creditLines.findByUserId(userId).map(this::snapshot);
    }

    /** The backend refuses to open without an explicit disclaimer acceptance, not just the UI. */
    public Snapshot open(UUID userId, boolean acceptedDisclaimer) {
        if (!acceptedDisclaimer) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Phải đọc và xác nhận điều khoản mô phỏng trước khi mở Ví Trả Sau");
        }
        return snapshot(executor.open(userId));
    }

    public Snapshot draw(UUID userId, BigDecimal amount, String label) {
        executor.draw(userId, amount, label == null || label.isBlank() ? "Mua sắm" : label.strip());
        return snapshotOf(userId);
    }

    public Snapshot refund(UUID userId, BigDecimal amount, String reason) {
        executor.refund(userId, amount, reason);
        return snapshotOf(userId);
    }

    /**
     * Claim (debt reduced + PENDING repayment, committed) → real wallet-service debit → mark
     * COMPLETED. On any debit failure the claim is reverted before the error is surfaced.
     */
    public Snapshot repay(UUID userId, BigDecimal amount) {
        return repay(userId, amount, false);
    }

    public Snapshot repay(UUID userId, BigDecimal amount, boolean stepUpConfirmed) {
        Repayment claimed = executor.claimRepayment(userId, amount);
        try {
            if (stepUpConfirmed) {
                walletServiceClient.debitRepayment(userId, amount, claimed.getId(), true);
            } else {
                walletServiceClient.debitRepayment(userId, amount, claimed.getId());
            }
        } catch (HttpClientErrorException.Conflict e) {
            // Insufficient main-wallet balance (or wallet-service's own optimistic-lock 409).
            executor.revertRepayment(userId, claimed.getId());
            String reason = e.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Không trừ được tiền từ ví chính: " + (reason.isBlank() ? "số dư không đủ" : reason));
        } catch (HttpClientErrorException e) {
            executor.revertRepayment(userId, claimed.getId());
            if (e.getStatusCode().value() == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), e.getResponseBodyAsString(StandardCharsets.UTF_8));
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gọi được wallet-service, khoản trả nợ đã được huỷ", e);
        } catch (RuntimeException e) {
            executor.revertRepayment(userId, claimed.getId());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gọi được wallet-service, khoản trả nợ đã được huỷ", e);
        }
        executor.completeRepayment(claimed.getId());
        return snapshotOf(userId);
    }

    private Snapshot snapshotOf(UUID userId) {
        return get(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa mở Ví Trả Sau"));
    }

    private Snapshot snapshot(CreditLine line) {
        LocalDate today = LocalDate.now(clock);
        List<Statement> all = statements.findByCreditLineIdOrderByPeriodAsc(line.getId());
        List<BnplCalculator.StatementDue> dues = all.stream().map(s -> calculator.due(s, today)).toList();
        BigDecimal total = dues.stream().map(BnplCalculator.StatementDue::totalDue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Snapshot(line, dues, total,
            draws.findByCreditLineIdOrderByCreatedAtDesc(line.getId()),
            repayments.findByCreditLineIdOrderByCreatedAtDesc(line.getId()), today);
    }
}
