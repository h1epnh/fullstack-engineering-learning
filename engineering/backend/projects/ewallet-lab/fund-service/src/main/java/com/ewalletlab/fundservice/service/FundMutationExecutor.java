package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundMember;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.domain.FundTransactionType;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import com.ewalletlab.fundservice.repository.FundTransactionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Holds the actual, single-attempt, {@code @Transactional} mutation logic for {@link Fund}, kept
 * separate from {@link FundService} for the same reason every other mutation-executor in this
 * project is (wallet-service's {@code WalletMutationExecutor}, issue #5): retrying a lost
 * optimistic-lock race, or a lost UNIQUE-constraint race on {@code addMemberOnce}, needs each
 * attempt to run in a brand-new transaction that re-reads the row(s) from scratch — only possible
 * through a proxy boundary, so the retry loop has to live in a different bean.
 *
 * <p><b>Member-invite race</b> (same bug CLASS as issue #12/#13's "creator at 20 concurrent
 * opens" — this lab's CLAUDE.md now calls this out explicitly: a brand-new UNIQUE constraint can be
 * violated on its very first concurrent INSERT, not just on update): {@code addMemberOnce} is
 * check-then-act ({@code findByFundIdAndMemberUserId(...).isEmpty()} then insert), protected only
 * by Postgres's UNIQUE constraint on {@code (fund_id, member_user_id)}. Two concurrent "invite this
 * same not-yet-a-member phone number" calls (e.g. the creator double-tapping "Mời") can both pass
 * the {@code isEmpty()} check before either INSERT commits; the loser's insert throws {@code
 * DataIntegrityViolationException} at flush time. {@link FundService#addMember} retries this whole
 * method on that exception — unlike family-wallet-service's equivalent fix, re-running
 * {@code addMemberOnce} here is always a clean no-op success (idempotent "already a member", not an
 * error) because invites in this MVP only ever come from the single creator, so there's no
 * "different parent" conflict branch to worry about.
 */
@Component
class FundMutationExecutor {

    private final FundRepository fundRepository;
    private final FundMemberRepository fundMemberRepository;
    private final FundTransactionRepository fundTransactionRepository;

    FundMutationExecutor(FundRepository fundRepository, FundMemberRepository fundMemberRepository,
                          FundTransactionRepository fundTransactionRepository) {
        this.fundRepository = fundRepository;
        this.fundMemberRepository = fundMemberRepository;
        this.fundTransactionRepository = fundTransactionRepository;
    }

    /** {@code transactionId} is the {@code FundTransaction} row this attempt just wrote — the
     * caller threads it back into {@link #compensateWithdraw} if the follow-up wallet-service
     * credit fails, so the compensation can remove exactly that row (see issue #14's ledger-vs-
     * balance mismatch bug: compensating the balance alone left a "phantom" WITHDRAWAL row that
     * never corresponded to any money that actually left the fund). */
    record WithdrawResult(Fund fund, UUID transactionId) {
    }

    record DissolveResult(Fund fund, BigDecimal remainder, UUID transactionId) {
    }

    @Transactional
    Fund findActiveOrThrow(UUID fundId) {
        return fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
    }

    /** Idempotent: inviting someone who's already a member of this fund just returns their existing
     * membership instead of erroring, same as family-wallet-service's upsert — simpler here because
     * there's nothing to "update" on a membership row (no per-member field like monthlyLimit). */
    @Transactional
    FundMember addMemberOnce(UUID fundId, UUID requesterUserId, UUID memberUserId, String memberPhone, String memberName) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được mời thành viên");
        }
        Optional<FundMember> existing = fundMemberRepository.findByFundIdAndMemberUserId(fundId, memberUserId);
        if (existing.isPresent()) {
            return existing.get();
        }
        return fundMemberRepository.save(new FundMember(fundId, memberUserId, memberPhone, memberName));
    }

    @Transactional
    Fund contributeOnce(UUID fundId, UUID memberUserId, BigDecimal amount) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        if (!fundMemberRepository.existsByFundIdAndMemberUserId(fundId, memberUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của quỹ nhóm này");
        }
        try {
            fund.contribute(amount);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
        fundRepository.save(fund);
        fundTransactionRepository.save(new FundTransaction(fundId, memberUserId, FundTransactionType.CONTRIBUTION, amount));
        return fund;
    }

    @Transactional
    WithdrawResult withdrawOnce(UUID fundId, UUID requesterUserId, BigDecimal amount) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được rút tiền khỏi quỹ");
        }
        try {
            fund.withdraw(amount);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
        fundRepository.save(fund);
        FundTransaction tx = fundTransactionRepository.save(
            new FundTransaction(fundId, requesterUserId, FundTransactionType.WITHDRAWAL, amount));
        return new WithdrawResult(fund, tx.getId());
    }

    @Transactional
    DissolveResult dissolveOnce(UUID fundId, UUID requesterUserId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        if (!fund.getCreatorUserId().equals(requesterUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người tạo quỹ mới được giải thể quỹ");
        }
        BigDecimal remainder;
        try {
            remainder = fund.dissolve();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
        fundRepository.save(fund);
        FundTransaction tx = fundTransactionRepository.save(
            new FundTransaction(fundId, requesterUserId, FundTransactionType.DISSOLVE, remainder));
        return new DissolveResult(fund, remainder, tx.getId());
    }

    /** Compensates a withdrawal whose follow-up wallet-service credit call failed — see
     * {@code FundService.withdraw}'s javadoc. Only the single caller that just performed
     * {@link #withdrawOnce} ever calls this for a given attempt, but it's still wrapped in
     * {@code FundService}'s optimistic-lock retry loop since the row's {@code @Version} has moved
     * on since {@code withdrawOnce} committed and an unrelated concurrent contribution could have
     * touched it in between.
     *
     * <p>Bug found by agent-tester on issue #14 (race ≥20 concurrent withdraws): reverting only
     * {@code Fund.balance} left the {@code FundTransaction} WITHDRAWAL row {@code withdrawOnce}
     * had already written — a "phantom" ledger entry for money that, thanks to this very
     * compensation, never actually left the fund. {@code transactionId} is that row's id;
     * deleting it here (same local transaction as the balance revert) keeps
     * {@code fund_transactions} an exact record of money that actually moved, with no entry for a
     * withdrawal that was fully undone. Uses find-then-delete (not {@code deleteById}, which
     * throws {@code EmptyResultDataAccessException} on a missing row) so a retry of this whole
     * method — e.g. after losing an optimistic-lock race on {@code fundRepository.save(fund)} — is
     * a safe no-op on the already-deleted row instead of surfacing a spurious failure. */
    @Transactional
    Fund compensateWithdraw(UUID fundId, BigDecimal amount, UUID transactionId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        fund.revertWithdraw(amount);
        fundRepository.save(fund);
        fundTransactionRepository.findById(transactionId).ifPresent(fundTransactionRepository::delete);
        return fund;
    }

    /** Compensates a dissolve whose follow-up wallet-service credit call failed — reopens the fund
     * (back to ACTIVE) with the undelivered remainder restored, same reasoning as
     * {@link #compensateWithdraw} (including deleting the phantom DISSOLVE ledger row — same bug
     * class, confirmed present here too when checked directly instead of assuming the fix for
     * withdraw covers it). */
    @Transactional
    Fund compensateDissolve(UUID fundId, BigDecimal remainder, UUID transactionId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        fund.revertDissolve(remainder);
        fundRepository.save(fund);
        fundTransactionRepository.findById(transactionId).ifPresent(fundTransactionRepository::delete);
        return fund;
    }
}
