package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundMember;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.domain.FundTransactionType;
import com.ewalletlab.fundservice.domain.OutboxEvent;
import com.ewalletlab.fundservice.domain.OutboxEventType;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import com.ewalletlab.fundservice.repository.FundTransactionRepository;
import com.ewalletlab.fundservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
 * <p><b>Issue #22 — Outbox pattern.</b> {@code contributeOnce}/{@code withdrawOnce}/{@code
 * dissolveOnce} now write an {@link OutboxEvent} (status {@code PENDING}) in the SAME transaction
 * as the business state they mutate, instead of {@link FundService} calling {@code
 * WalletServiceClient} directly afterwards — see backend DESIGN.md's "Outbox pattern" section for
 * the full rationale and {@code FundOutboxRelay} for what actually calls wallet-service now. The
 * {@code compensateXxx} methods below are UNCHANGED in what they do (revert the local claim, delete
 * the phantom ledger row — same fix as issue #14's second bug) but are now called ONLY by {@code
 * FundOutboxRelay} after it gives up on a permanently-failing outbox event, never synchronously
 * from {@link FundService} anymore — one mechanism, not two in parallel.
 *
 * <p><b>Member-invite race</b> (same bug CLASS as issue #12/#13's "creator at 20 concurrent
 * opens" — this lab's CLAUDE.md now calls this out explicitly: a brand-new UNIQUE constraint can be
 * violated on its very first concurrent INSERT, not just on update): {@code addMemberOnce} is
 * check-then-act ({@code findByFundIdAndMemberUserId(...).isEmpty()} then insert), protected only
 * by Postgres's UNIQUE constraint on {@code (fund_id, member_user_id)}. Two concurrent "invite this
 * same not-yet-a-member phone number" calls (e.g. the creator double-tapping "Mời") can both pass
 * the {@code isEmpty()} check before either INSERT commits; the loser's insert throws {@code
 * DataIntegrityViolationException} at flush time. {@code FundService#addMember} retries this whole
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
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    FundMutationExecutor(FundRepository fundRepository, FundMemberRepository fundMemberRepository,
                          FundTransactionRepository fundTransactionRepository,
                          OutboxEventRepository outboxEventRepository, ObjectMapper objectMapper) {
        this.fundRepository = fundRepository;
        this.fundMemberRepository = fundMemberRepository;
        this.fundTransactionRepository = fundTransactionRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    /** {@code transactionId} is the {@code FundTransaction} row this attempt just wrote, {@code
     * outboxEventId} is the {@link OutboxEvent} row that will carry the follow-up wallet-service
     * call — both threaded back so {@code FundController}/tests/logging can reference them, though
     * {@code FundService} itself no longer needs to act on either (the relay owns the rest). */
    record ContributeResult(Fund fund, UUID transactionId, UUID outboxEventId) {
    }

    record WithdrawResult(Fund fund, UUID transactionId, UUID outboxEventId) {
    }

    record DissolveResult(Fund fund, BigDecimal remainder, UUID transactionId, UUID outboxEventId) {
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

    /** Issue #22 — claims the contribution LOCALLY first (optimistically credits {@code
     * Fund.balance}, same "claim trước" shape {@code withdraw}/{@code dissolve} already used, just
     * inverted direction) and writes a {@code FUND_CONTRIBUTE_DEBIT} outbox event for {@code
     * FundOutboxRelay} to actually debit the member's wallet — see {@code FundService#contribute}'s
     * javadoc for why the step-up GATE still runs synchronously before this is ever called. */
    @Transactional
    ContributeResult contributeOnce(UUID fundId, UUID memberUserId, BigDecimal amount, boolean stepUpConfirmed) {
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
        FundTransaction tx = fundTransactionRepository.save(new FundTransaction(fundId, memberUserId, FundTransactionType.CONTRIBUTION, amount));
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.pending(OutboxEventType.FUND_CONTRIBUTE_DEBIT,
            writePayload(new OutboxPayload(fundId, memberUserId, amount, tx.getId(), stepUpConfirmed))));
        return new ContributeResult(fund, tx.getId(), event.getId());
    }

    /** Issue #22 — same local-claim-first shape as before (issue #14), but now writes a {@code
     * FUND_WITHDRAW_CREDIT} outbox event instead of leaving the follow-up wallet-service credit to
     * {@link FundService} — see that class's old javadoc (removed) for the bug this used to need a
     * hand-rolled compensate-with-retry + background reconciler to paper over. */
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
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.pending(OutboxEventType.FUND_WITHDRAW_CREDIT,
            writePayload(new OutboxPayload(fundId, requesterUserId, amount, tx.getId(), false))));
        return new WithdrawResult(fund, tx.getId(), event.getId());
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
        OutboxEvent event = outboxEventRepository.save(OutboxEvent.pending(OutboxEventType.FUND_DISSOLVE_CREDIT,
            writePayload(new OutboxPayload(fundId, requesterUserId, remainder, tx.getId(), false))));
        return new DissolveResult(fund, remainder, tx.getId(), event.getId());
    }

    /** Compensates a contribution whose outbox-relayed debit permanently failed (see {@link
     * Fund#revertContribute}) — called only by {@code FundOutboxRelay}, see that class for the
     * "permanently failed" decision. Find-then-delete (not {@code deleteById}), same reasoning as
     * {@link #compensateWithdraw}: safe to re-run if a previous attempt got this far and then lost
     * the optimistic-lock race on {@code fundRepository.save}. */
    @Transactional
    Fund compensateContribute(UUID fundId, BigDecimal amount, UUID transactionId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        fund.revertContribute(amount);
        fundRepository.save(fund);
        fundTransactionRepository.findById(transactionId).ifPresent(fundTransactionRepository::delete);
        return fund;
    }

    /** Compensates a withdrawal whose outbox-relayed credit permanently failed — see {@code
     * FundOutboxRelay} for the retry/permanent-failure decision that leads here (issue #22) and
     * issue #14's original bug for why {@code transactionId} must be deleted here too, not just
     * {@code Fund.balance} reverted. Find-then-delete (not {@code deleteById}, which throws {@code
     * EmptyResultDataAccessException} on a missing row) so a retry of this whole method — e.g.
     * after losing an optimistic-lock race on {@code fundRepository.save(fund)} — is a safe no-op
     * on the already-deleted row instead of surfacing a spurious failure. */
    @Transactional
    Fund compensateWithdraw(UUID fundId, BigDecimal amount, UUID transactionId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        fund.revertWithdraw(amount);
        fundRepository.save(fund);
        fundTransactionRepository.findById(transactionId).ifPresent(fundTransactionRepository::delete);
        return fund;
    }

    /** Compensates a dissolve whose outbox-relayed credit permanently failed — reopens the fund
     * (back to ACTIVE) with the undelivered remainder restored, same reasoning as
     * {@link #compensateWithdraw} (including deleting the phantom DISSOLVE ledger row). */
    @Transactional
    Fund compensateDissolve(UUID fundId, BigDecimal remainder, UUID transactionId) {
        Fund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ nhóm này"));
        fund.revertDissolve(remainder);
        fundRepository.save(fund);
        fundTransactionRepository.findById(transactionId).ifPresent(fundTransactionRepository::delete);
        return fund;
    }

    private String writePayload(OutboxPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            // Never actually happens for a flat record of primitives/UUID/BigDecimal — but if it
            // somehow did, failing the whole local transaction (business state rolls back too) is
            // far safer than silently writing a business-state row with no outbox follow-up at all.
            throw new IllegalStateException("Không thể serialize outbox payload", e);
        }
    }
}
