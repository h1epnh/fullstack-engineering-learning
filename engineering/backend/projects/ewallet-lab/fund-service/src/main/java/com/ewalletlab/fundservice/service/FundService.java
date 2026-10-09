package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundMember;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import com.ewalletlab.fundservice.repository.FundTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Issue #14 — "Quỹ nhóm" (operator's architecture decision, option (a): a stand-alone
 * {@code fund-service}, see Fund's class javadoc). Unlike {@code payment-request-service}, which
 * always settles through transfer-service's P2P saga, a fund's "other side" of a money movement
 * isn't a wallet at all — it's this service's own {@link Fund#getBalance()} — so this service calls
 * wallet-service's {@code /credit}/{@code /debit} directly, same pattern as lucky-money-service
 * (issue #10).
 *
 * <p><b>Issue #22 — Outbox pattern.</b> This class no longer calls {@code WalletServiceClient}'s
 * {@code credit}/{@code debit} at all (see backend DESIGN.md's "Outbox pattern" section for the
 * full before/after and why). {@code contribute}/{@code withdraw}/{@code dissolve} now ONLY claim
 * the local state change — {@code FundMutationExecutor.contributeOnce}/{@code withdrawOnce}/{@code
 * dissolveOnce} write the matching {@code OutboxEvent} in the same transaction — and return.
 * {@code FundOutboxRelay}'s background job is the only thing that actually calls wallet-service for
 * these 3 operations now, with its own retry/compensation handling. This removed a large amount of
 * machinery that used to live here: {@code compensateWithRetry}, {@code mapCreditFailure}, the
 * dedicated {@code MAX_COMPENSATION_ATTEMPTS}/jittered-backoff constants, and the {@code
 * FundCompensationFailure}/{@code FundCompensationReconciler} safety net for when compensation
 * itself lost every retry — all 3 of those existed ONLY to paper over gaps in the old
 * "network-call-then-catch-then-compensate" shape that the outbox pattern closes structurally
 * instead (see the next paragraph for the one place that shape is deliberately KEPT).
 *
 * <p>{@link #contribute} still makes ONE synchronous call to wallet-service before touching any
 * local state: a read-only step-up pre-check ({@code WalletServiceClient#stepUpCheck}). This is
 * NOT a regression back to the old dual-write shape — nothing is mutated by it. It exists because
 * moving the actual DEBIT into the outbox-relayed path means there's no live HTTP request anymore
 * at the moment wallet-service would otherwise ask for step-up confirmation (issue #15) — CLAUDE.md's
 * Enterprise Architecture Alignment principle 2 requires regulatory/compliance gates to fail CLOSED,
 * so this has to be checked and enforced before any state is claimed, not discovered later by the
 * relay with no user left to confirm anything. Exactly the same shape topup-service already uses
 * for TOPUP's own async (Kafka-driven) credit — not a new pattern in this codebase.
 */
@Service
public class FundService {

    private static final Logger log = LoggerFactory.getLogger(FundService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    private final FundRepository fundRepository;
    private final FundMemberRepository fundMemberRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final FundMutationExecutor mutationExecutor;

    public FundService(FundRepository fundRepository, FundMemberRepository fundMemberRepository,
                        FundTransactionRepository fundTransactionRepository,
                        UserServiceClient userServiceClient,
                        WalletServiceClient walletServiceClient, FundMutationExecutor mutationExecutor) {
        this.fundRepository = fundRepository;
        this.fundMemberRepository = fundMemberRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
        this.mutationExecutor = mutationExecutor;
    }

    /** Creator is auto-added as a member of their own fund (so they show up in the member list and
     * can contribute like anyone else) — a single INSERT at creation time, no concurrent caller can
     * race it, so no retry/unique-constraint handling needed here (unlike {@link #addMember}).
     * Looks the creator up by id (not phone) via user-service, same reasoning as {@link
     * UserServiceClient#findById} javadoc — trusts user-service's own record, not a client-supplied
     * display name, for the denormalized {@code creatorName}/{@code creatorPhone} on {@link Fund}. */
    public Fund create(UUID creatorUserId, String name, String purpose) {
        UserServiceClient.UserResponse creator;
        try {
            creator = userServiceClient.findById(creatorUserId);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Ewallet Lab này");
        }
        Fund fund = fundRepository.save(new Fund(creatorUserId, creator.name(), creator.phone(), name, purpose));
        fundMemberRepository.save(new FundMember(fund.getId(), creatorUserId, creator.phone(), creator.name()));
        return fund;
    }

    public Fund get(UUID fundId, UUID requesterUserId) {
        Fund fund = requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fund;
    }

    public List<Fund> listForMember(UUID memberUserId) {
        return fundMemberRepository.findByMemberUserId(memberUserId).stream()
            .map(FundMember::getFundId)
            .distinct()
            .map(this::requireFund)
            .toList();
    }

    public List<FundMember> listMembers(UUID fundId, UUID requesterUserId) {
        requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fundMemberRepository.findByFundIdOrderByJoinedAtAsc(fundId);
    }

    public List<FundTransaction> listTransactions(UUID fundId, UUID requesterUserId) {
        requireFund(fundId);
        requireMember(fundId, requesterUserId);
        return fundTransactionRepository.findByFundIdOrderByCreatedAtDesc(fundId);
    }

    public FundMember addMember(UUID fundId, UUID requesterUserId, String memberPhone) {
        UserServiceClient.UserResponse member;
        try {
            member = userServiceClient.findByPhone(memberPhone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy tài khoản Ewallet Lab với số điện thoại này");
        }
        return withRetry("addMember", fundId,
            () -> mutationExecutor.addMemberOnce(fundId, requesterUserId, member.id(), member.phone(), member.name()));
    }

    /** See this class's javadoc for why the step-up gate runs HERE, synchronously, before any local
     * state is claimed — the actual wallet-service debit happens later, via the outbox relay. */
    public Fund contribute(UUID fundId, UUID memberUserId, BigDecimal amount, boolean stepUpConfirmed) {
        Fund fund = requireFund(fundId);
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, memberUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
        WalletServiceClient.StepUpCheckResult check = walletServiceClient.stepUpCheck(memberUserId, amount);
        if (check.required() && !stepUpConfirmed) {
            throw new ResponseStatusException(HttpStatus.valueOf(428), describeStepUpRequirement(check));
        }
        return withRetry("contribute", fundId,
            () -> mutationExecutor.contributeOnce(fundId, memberUserId, amount, stepUpConfirmed).fund());
    }

    /** Issue #22 — claims the withdrawal locally (optimistic lock + balance/status validation,
     * SAME transaction as the matching outbox event) and returns immediately; the actual credit to
     * the creator's wallet is relayed in the background by {@code FundOutboxRelay}. */
    public Fund withdraw(UUID fundId, UUID requesterUserId, BigDecimal amount) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được rút tiền khỏi quỹ");
        }
        return withRetry("withdraw", fundId, () -> mutationExecutor.withdrawOnce(fundId, requesterUserId, amount).fund());
    }

    public Fund dissolve(UUID fundId, UUID requesterUserId) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được giải thể quỹ");
        }
        return withRetry("dissolve", fundId, () -> mutationExecutor.dissolveOnce(fundId, requesterUserId).fund());
    }

    /** Same Vietnamese copy as topup-service's {@code TopupService#describeStepUpRequirement} —
     * built from the thresholds the check response actually returned rather than a second
     * hardcoded copy of the numbers, so the services can't drift out of sync. */
    private static String describeStepUpRequirement(WalletServiceClient.StepUpCheckResult check) {
        return ("Giao dịch trên %s/lần hoặc tổng giao dịch chuyển tiền/thanh toán/nạp ví trong ngày "
            + "đạt %s cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN (mô phỏng — lab này không có sinh "
            + "trắc học thật, chỉ yêu cầu 1 bước xác nhận bổ sung)")
            .formatted(formatVnd(check.singleThreshold()), formatVnd(check.dailyThreshold()));
    }

    private static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }

    private Fund requireFund(UUID fundId) {
        return fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
    }

    /** Real MoMo's "Quỹ nhóm" (fetched directly, momo.vn/quy-nhom): "Only approved members can view
     * and access fund operation information" — mirrored here for GET endpoints. */
    private void requireMember(UUID fundId, UUID requesterUserId) {
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
    }

    /** Same combined retry shape as wallet-service's {@code SavingsPocketService.withRetry} (issue
     * #13's fix): one loop handles BOTH a lost optimistic-lock race (balance mutations — retried
     * against the freshly-committed row) AND a lost UNIQUE-constraint race on
     * {@code addMemberOnce} (retried so the next attempt observes the winner's now-committed
     * membership row and returns it instead of surfacing a raw 500). */
    private <T> T withRetry(String op, UUID fundId, Supplier<T> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on fund={} lost the optimistic-lock race {} times in a row, giving up — 409",
                        op, fundId, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("{} on fund={} lost optimistic-lock race, retrying (attempt {}/{})", op, fundId, i, MAX_ATTEMPTS);
                sleep(RETRY_BACKOFF_MILLIS * i);
            } catch (DataIntegrityViolationException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on fund={} lost a unique-constraint race {} times in a row, giving up — 409",
                        op, fundId, MAX_ATTEMPTS);
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Xung đột khi thao tác trên quỹ nhóm (trùng thời điểm), vui lòng thử lại");
                }
                log.debug("{} on fund={} lost a unique-constraint race (likely concurrent invite), retrying ({}/{})",
                    op, fundId, i, MAX_ATTEMPTS);
            }
        }
        throw new IllegalStateException("unreachable");
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
