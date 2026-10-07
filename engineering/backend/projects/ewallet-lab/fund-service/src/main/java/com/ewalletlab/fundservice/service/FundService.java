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
                        FundTransactionRepository fundTransactionRepository, UserServiceClient userServiceClient,
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
            withRetry("compensate-withdraw", fundId,
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
                withRetry("compensate-dissolve", fundId,
                    () -> mutationExecutor.compensateDissolve(fundId, result.remainder(), result.transactionId()));
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
