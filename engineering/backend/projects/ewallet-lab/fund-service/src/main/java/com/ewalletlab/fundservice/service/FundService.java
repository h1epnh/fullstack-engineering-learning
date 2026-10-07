package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundCompensationFailure;
import com.ewalletlab.fundservice.domain.FundMember;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.domain.FundTransactionType;
import com.ewalletlab.fundservice.repository.FundCompensationFailureRepository;
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
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Supplier;

/**
 * Issue #14 — "Quỹ nhóm" (operator's architecture decision, option (a): a stand-alone
 * {@code fund-service}, see Fund's class javadoc). Unlike {@code payment-request-service}, which
 * always settles through transfer-service's P2P saga, a fund's "other side" of a money movement
 * isn't a wallet at all — it's this service's own {@link Fund#getBalance()} — so this service calls
 * wallet-service's {@code /credit}/{@code /debit} directly, same pattern as lucky-money-service
 * (issue #10).
 */
@Service
public class FundService {

    private static final Logger log = LoggerFactory.getLogger(FundService.class);
    private static final int MAX_ATTEMPTS = 4;
    private static final long RETRY_BACKOFF_MILLIS = 25;

    /**
     * Issue #14 — bug found by agent-tester at ≥60 concurrent withdraws/1 fund: {@code
     * compensateWithdraw}/{@code compensateDissolve} run AFTER money has already been decremented
     * locally (the wallet-service credit that was supposed to follow it failed), so unlike every
     * other mutation on {@link Fund} — where losing the optimistic-lock race just means "nothing
     * was committed yet, a 409 asking the client to retry is harmless" — losing THIS race means
     * real money is stuck mid-flight (debited from the fund, never credited to the wallet, and
     * nothing left to auto-revert it). It must not share {@link #MAX_ATTEMPTS}/{@link
     * #RETRY_BACKOFF_MILLIS} with normal operations: a much larger budget, with jittered backoff
     * (plain {@code backoff * attempt} without jitter means every losing thread tends to wake up
     * and collide again at the same instants, which is exactly the failure mode agent-tester hit
     * at high concurrency) buys a compensation attempt many more chances to land in a gap between
     * the dozens of OTHER concurrent withdraws still hammering the same {@code Fund} row before
     * giving up and falling back to {@link #recordStuckCompensation}.
     */
    private static final int MAX_COMPENSATION_ATTEMPTS = 30;
    private static final long COMPENSATION_BACKOFF_BASE_MILLIS = 20;
    private static final long COMPENSATION_BACKOFF_CAP_MILLIS = 150;
    private static final long COMPENSATION_BACKOFF_JITTER_MILLIS = 40;

    private final FundRepository fundRepository;
    private final FundMemberRepository fundMemberRepository;
    private final FundTransactionRepository fundTransactionRepository;
    private final FundCompensationFailureRepository compensationFailureRepository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final FundMutationExecutor mutationExecutor;

    public FundService(FundRepository fundRepository, FundMemberRepository fundMemberRepository,
                        FundTransactionRepository fundTransactionRepository,
                        FundCompensationFailureRepository compensationFailureRepository,
                        UserServiceClient userServiceClient,
                        WalletServiceClient walletServiceClient, FundMutationExecutor mutationExecutor) {
        this.fundRepository = fundRepository;
        this.fundMemberRepository = fundMemberRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.compensationFailureRepository = compensationFailureRepository;
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

    /**
     * Debit(member) happens first (same "escrow at creation" shape as lucky-money-service's
     * {@code send}), the local credit-to-fund-balance second. If the local step then fails (fund
     * was concurrently dissolved, or a sustained optimistic-lock conflict), the whole local
     * transaction rolled back — nothing was actually committed on the fund side — so the only thing
     * left to undo is the wallet debit, refunded back to the member.
     */
    public Fund contribute(UUID fundId, UUID memberUserId, BigDecimal amount, boolean stepUpConfirmed) {
        Fund fund = requireFund(fundId);
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, memberUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
        try {
            walletServiceClient.debit(memberUserId, amount, "TRANSFER_OUT", fundId.toString(),
                "Góp vào quỹ nhóm " + fund.getName(), stepUpConfirmed);
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để góp quỹ");
        } catch (HttpClientErrorException e) {
            // Issue #15 interaction — 428 isn't a named HttpClientErrorException subclass, needs an
            // explicit status check (same pattern as payment-request-service's pay()).
            if (e.getStatusCode().value() == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), e.getResponseBodyAsString());
            }
            throw e;
        }

        try {
            return withRetry("contribute", fundId, () -> mutationExecutor.contributeOnce(fundId, memberUserId, amount));
        } catch (RuntimeException e) {
            log.warn("contribute to fund={} by member={} committed locally failed after wallet debit " +
                "already succeeded — refunding {} back to member's wallet", fundId, memberUserId, amount);
            walletServiceClient.credit(memberUserId, amount, "REFUND", fundId.toString(),
                "Hoàn tiền góp quỹ nhóm thất bại");
            throw e;
        }
    }

    /**
     * Local balance decrement happens first, protected by optimistic locking (same order as
     * lucky-money-service's {@code claim}: claim the state transition atomically before any real
     * money moves) — only once that's safely committed does the actual wallet-service credit run.
     * If THAT external call fails, the local decrement is compensated (added back) so money isn't
     * silently lost from the fund's own accounting.
     */
    public Fund withdraw(UUID fundId, UUID requesterUserId, BigDecimal amount) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được rút tiền khỏi quỹ");
        }
        FundMutationExecutor.WithdrawResult result =
            withRetry("withdraw", fundId, () -> mutationExecutor.withdrawOnce(fundId, requesterUserId, amount));
        try {
            walletServiceClient.credit(requesterUserId, amount, "TRANSFER_IN", fundId.toString(),
                "Rút từ quỹ nhóm " + fund.getName());
        } catch (RuntimeException e) {
            log.warn("withdraw from fund={} decremented locally but wallet-service credit failed — " +
                "compensating by adding {} back to the fund and removing the phantom ledger row {}",
                fundId, amount, result.transactionId());
            compensateWithRetry(FundTransactionType.WITHDRAWAL, fundId, amount, result.transactionId(), requesterUserId,
                () -> mutationExecutor.compensateWithdraw(fundId, amount, result.transactionId()));
            throw mapCreditFailure(e, "Rút quỹ");
        }
        return result.fund();
    }

    public Fund dissolve(UUID fundId, UUID requesterUserId) {
        Fund fund = requireFund(fundId);
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được giải thể quỹ");
        }
        FundMutationExecutor.DissolveResult result =
            withRetry("dissolve", fundId, () -> mutationExecutor.dissolveOnce(fundId, requesterUserId));
        if (result.remainder().signum() > 0) {
            try {
                walletServiceClient.credit(requesterUserId, result.remainder(), "TRANSFER_IN", fundId.toString(),
                    "Giải thể quỹ nhóm " + fund.getName());
            } catch (RuntimeException e) {
                log.warn("dissolve of fund={} zeroed locally but wallet-service credit of remainder={} failed — " +
                    "reopening the fund and removing the phantom ledger row {}",
                    fundId, result.remainder(), result.transactionId());
                compensateWithRetry(FundTransactionType.DISSOLVE, fundId, result.remainder(), result.transactionId(),
                    requesterUserId, () -> mutationExecutor.compensateDissolve(fundId, result.remainder(), result.transactionId()));
                throw mapCreditFailure(e, "Giải thể quỹ");
            }
        }
        return result.fund();
    }

    /** Maps a failure from the credit-AFTER-local-commit step (withdraw/dissolve's follow-up
     * wallet-service call) to a proper status + Vietnamese message, instead of letting it escape
     * as a raw exception that {@code FundController} can't recognize (surfaces as a bare 500 —
     * bug found by agent-tester on issue #14, same race: wallet-service's OWN optimistic lock on
     * the creator's wallet rejects a credit with 409 under concurrent withdraws). The local
     * compensation has already run by the time this is called — the fund's balance/ledger are
     * already back to a consistent state, so the client just needs to know the attempt itself
     * didn't go through and it's safe to retry. */
    private ResponseStatusException mapCreditFailure(RuntimeException e, String action) {
        if (e instanceof HttpClientErrorException httpEx) {
            HttpStatus status = httpEx.getStatusCode().value() == 409 ? HttpStatus.CONFLICT : HttpStatus.BAD_GATEWAY;
            return new ResponseStatusException(status, action + " thất bại do wallet-service từ chối giao dịch ("
                + httpEx.getStatusCode().value() + "), quỹ đã được hoàn lại số dư, vui lòng thử lại");
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY,
            action + " thất bại do lỗi khi gọi wallet-service, quỹ đã được hoàn lại số dư, vui lòng thử lại");
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

    /**
     * Retries a withdraw/dissolve compensation with the much larger budget described on {@link
     * #MAX_COMPENSATION_ATTEMPTS} — and if it STILL loses every attempt, does NOT let the raw
     * {@code ObjectOptimisticLockingFailureException} escape to {@code FundController}'s generic
     * handler (which would return the exact same 409/"đang được xử lý ở giao dịch khác" message as
     * a completely harmless everyday conflict — indistinguishable from this, a case where real
     * money is actually stuck, per agent-tester's finding on issue #14). Instead: logs at ERROR
     * (not {@code warn} — this needs to be alertable, not just debuggable), persists a {@link
     * FundCompensationFailure} row so {@code FundCompensationReconciler}'s background job can keep
     * retrying exactly this compensation until it eventually succeeds, and throws a distinct 500
     * with a message that tells the caller this is NOT a normal "just retry the same request"
     * conflict.
     */
    private Fund compensateWithRetry(FundTransactionType action, UUID fundId, BigDecimal amount,
                                      UUID transactionId, UUID requesterUserId, Supplier<Fund> attempt) {
        for (int i = 1; i <= MAX_COMPENSATION_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_COMPENSATION_ATTEMPTS) {
                    UUID failureId = recordStuckCompensation(action, fundId, amount, transactionId, requesterUserId);
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Giao dịch thất bại và việc hoàn tiền tự động CŨNG thất bại do hệ thống đang quá tải — " +
                        "số tiền đang tạm kẹt (đã trừ khỏi quỹ, chưa hoàn lại), hệ thống đã ghi nhận để tự xử lý " +
                        "lại trong ít giây tới. KHÔNG thử lại giao dịch này ngay — vui lòng kiểm tra lại số dư quỹ " +
                        "sau, nếu vẫn sai lệch liên hệ hỗ trợ với mã tham chiếu: " + failureId);
                }
                log.debug("compensate-{} on fund={} lost the optimistic-lock race, retrying ({}/{})",
                    action, fundId, i, MAX_COMPENSATION_ATTEMPTS);
                sleep(jitteredCompensationBackoff(i));
            }
        }
        throw new IllegalStateException("unreachable");
    }

    private static long jitteredCompensationBackoff(int attempt) {
        long base = Math.min(COMPENSATION_BACKOFF_BASE_MILLIS * attempt, COMPENSATION_BACKOFF_CAP_MILLIS);
        return base + ThreadLocalRandom.current().nextLong(COMPENSATION_BACKOFF_JITTER_MILLIS);
    }

    /** Last resort for issue #14's "tiền kẹt mid-flight" bug class — see {@link
     * FundCompensationFailure}'s javadoc for the full picture and {@code FundCompensationReconciler}
     * for what eventually clears this row. Logged at ERROR (this is real, confirmed-stuck money,
     * not a routine conflict) with every field needed to find/fix it by hand if the background job
     * is somehow not running. */
    private UUID recordStuckCompensation(FundTransactionType action, UUID fundId, BigDecimal amount,
                                          UUID transactionId, UUID requesterUserId) {
        FundCompensationFailure failure =
            compensationFailureRepository.save(new FundCompensationFailure(fundId, transactionId, requesterUserId, amount, action));
        log.error("FUND_MONEY_STUCK — compensate-{} on fund={} transactionId={} amount={} requester={} " +
            "exhausted {} retries against sustained optimistic-lock contention — fund balance is NOT yet " +
            "reverted and the phantom FundTransaction row is NOT yet deleted; recorded as " +
            "FundCompensationFailure id={} for the background reconciler to keep retrying — if this keeps " +
            "failing, needs manual DB intervention (see DESIGN.md's Quỹ nhóm section)",
            action, fundId, transactionId, amount, requesterUserId, MAX_COMPENSATION_ATTEMPTS, failure.getId());
        return failure.getId();
    }

    /** Same combined retry shape as wallet-service's {@code SavingsPocketService.withRetry} (issue
     * #13's fix): one loop handles BOTH a lost optimistic-lock race (balance mutations — retried
     * against the freshly-committed row) AND a lost UNIQUE-constraint race on
     * {@code addMemberOnce} (retried so the next attempt observes the winner's now-committed
     * membership row and returns it instead of surfacing a raw 500). NOT used for withdraw/
     * dissolve's compensation step — see {@link #compensateWithRetry} for why that needs a very
     * different (much larger, jittered) retry budget. */
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
