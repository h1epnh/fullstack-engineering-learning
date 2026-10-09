package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.OutboxEvent;
import com.ewalletlab.fundservice.domain.OutboxEventStatus;
import com.ewalletlab.fundservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Instant;
import java.util.List;

/**
 * Issue #22 — Outbox pattern pilot. The ONLY thing that calls wallet-service's {@code /credit}/
 * {@code /debit} for a fund's contribute/withdraw/dissolve now — {@code FundService} only ever
 * claims local state and writes a {@code PENDING} {@link OutboxEvent} in the same transaction (see
 * {@code FundMutationExecutor}). See backend DESIGN.md's "Outbox pattern" section for the full
 * rationale, including the exact issue #14 bug and the heavier "process killed mid-flight" risk
 * class that motivated this over the old synchronous try/catch-compensate shape.
 *
 * <p><b>Polling interval — 10 seconds.</b> Chosen to match the UX-vs-load tradeoff already
 * established by this exact service's old {@code FundCompensationReconciler} (15s) for a very
 * similar background job, tightened slightly because this is now the PRIMARY delivery path for
 * every contribute/withdraw/dissolve (not a rare exceptional-path safety net) — 10s keeps the
 * user-visible "money actually lands in the wallet" delay to a single-digit number of seconds in
 * the common case while still only polling wallet-service once per tick (for however many events
 * are PENDING), not once per request.
 *
 * <p><b>Single fund-service replica assumed</b> (see {@code OutboxEventRepository}'s javadoc) — no
 * {@code SELECT ... FOR UPDATE SKIP LOCKED} or equivalent needed for this pilot; flagged in
 * DESIGN.md as required follow-up if fund-service is ever scaled to &gt;1 replica.
 *
 * <p><b>Retry/permanent-failure policy</b> — deliberately asymmetric by error class, not a single
 * fixed retry count, because a wallet-service 409 is ambiguous by HTTP status alone (it means
 * EITHER "insufficient balance", a real and common permanent business failure for {@code
 * FUND_CONTRIBUTE_DEBIT}, OR "lost every one of wallet-service's own internal optimistic-lock
 * retries under contention", a transient condition that a plain retry on the NEXT tick will almost
 * always resolve — see wallet-service's {@code WalletController}, both map to the same 409):
 * <ul>
 *   <li>Any {@link HttpClientErrorException} (4xx: 400/409/428) — counts towards {@link
 *   #PERMANENT_FAILURE_ATTEMPTS}. Below that count, just retried on the next tick (covers
 *   transient 409 lock-contention without misclassifying it). At/above it, treated as a genuinely
 *   permanent business failure: the matching local claim is compensated ({@code
 *   FundMutationExecutor#compensateContribute}/{@code compensateWithdraw}/{@code
 *   compensateDissolve}) and the event is marked {@code FAILED} — terminal, no money left
 *   unaccounted for (either delivered, or reverted).</li>
 *   <li>Anything else (5xx, network/timeout errors) — retried FOREVER, never auto-compensated,
 *   because wallet-service genuinely might have already applied the mutation server-side before
 *   the error occurred (ambiguous outcome) — compensating here could wrongly revert a transfer that
 *   actually succeeded. Safe specifically because of the idempotency key: an eventual retry that
 *   finds the mutation already applied is a clean no-op, never a double-apply. Logged at WARN,
 *   escalated to ERROR after {@link #ERROR_LOG_ESCALATION_ATTEMPTS} attempts purely for
 *   operational visibility (grep {@code FUND_OUTBOX_STUCK}) — this is the one case this pilot
 *   accepts can, in theory, retry indefinitely without a human noticing unless they're watching
 *   logs; documented as a known limitation in DESIGN.md, same category as the old {@code
 *   FundCompensationFailure}'s "needs manual DB intervention" worst case, just without a dedicated
 *   table to query (this one row IS the queryable record — {@code SELECT * FROM outbox_event WHERE
 *   status='PENDING' AND attempt_count > 10}).</li>
 * </ul>
 */
@Component
class FundOutboxRelay {

    private static final Logger log = LoggerFactory.getLogger(FundOutboxRelay.class);
    private static final long FIXED_DELAY_MILLIS = 10_000;
    static final int PERMANENT_FAILURE_ATTEMPTS = 3;
    private static final int ERROR_LOG_ESCALATION_ATTEMPTS = 10;

    private final OutboxEventRepository outboxEventRepository;
    private final FundMutationExecutor mutationExecutor;
    private final WalletServiceClient walletServiceClient;
    private final ObjectMapper objectMapper;

    FundOutboxRelay(OutboxEventRepository outboxEventRepository, FundMutationExecutor mutationExecutor,
                     WalletServiceClient walletServiceClient, ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.mutationExecutor = mutationExecutor;
        this.walletServiceClient = walletServiceClient;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = FIXED_DELAY_MILLIS, initialDelay = FIXED_DELAY_MILLIS)
    void relay() {
        List<OutboxEvent> pending = outboxEventRepository.findByStatusOrderByCreatedAtAsc(OutboxEventStatus.PENDING);
        for (OutboxEvent event : pending) {
            relayOnce(event);
        }
    }

    private void relayOnce(OutboxEvent event) {
        OutboxPayload payload = readPayload(event);
        String idempotencyKey = event.getId().toString();
        try {
            switch (event.getEventType()) {
                case FUND_CONTRIBUTE_DEBIT -> walletServiceClient.debit(payload.userId(), payload.amount(),
                    "TRANSFER_OUT", payload.fundId().toString(), "Góp vào quỹ nhóm (outbox relay)",
                    payload.stepUpConfirmed(), idempotencyKey);
                case FUND_WITHDRAW_CREDIT -> walletServiceClient.credit(payload.userId(), payload.amount(),
                    "TRANSFER_IN", payload.fundId().toString(), "Rút từ quỹ nhóm (outbox relay)", idempotencyKey);
                case FUND_DISSOLVE_CREDIT -> walletServiceClient.credit(payload.userId(), payload.amount(),
                    "TRANSFER_IN", payload.fundId().toString(), "Giải thể quỹ nhóm (outbox relay)", idempotencyKey);
            }
            event.markDelivered(Instant.now());
            outboxEventRepository.save(event);
            log.info("outbox event {} ({}) delivered to wallet-service after {} attempt(s)",
                event.getId(), event.getEventType(), event.getAttemptCount() + 1);
        } catch (HttpClientErrorException e) {
            handleClientError(event, payload, e);
        } catch (RuntimeException e) {
            handleTransientError(event, e);
        }
    }

    private void handleClientError(OutboxEvent event, OutboxPayload payload, HttpClientErrorException e) {
        event.recordAttemptFailure(e.getStatusCode().value() + " " + e.getResponseBodyAsString());
        if (event.getAttemptCount() < PERMANENT_FAILURE_ATTEMPTS) {
            outboxEventRepository.save(event);
            log.warn("outbox event {} ({}) got {} from wallet-service, attempt {}/{}, retrying next tick",
                event.getId(), event.getEventType(), e.getStatusCode(), event.getAttemptCount(), PERMANENT_FAILURE_ATTEMPTS);
            return;
        }
        try {
            compensate(event, payload);
            event.markFailed(e.getStatusCode().value() + " " + e.getResponseBodyAsString());
            outboxEventRepository.save(event);
            log.error("outbox event {} ({}) permanently failed after {} attempts ({}) — compensated local " +
                "fund state (reverted the optimistic claim, deleted the phantom ledger row), marked FAILED",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.getStatusCode());
        } catch (ObjectOptimisticLockingFailureException lockEx) {
            outboxEventRepository.save(event);
            log.error("outbox event {} ({}) is permanently failing wallet-service AND its own compensation " +
                "just lost an optimistic-lock race on Fund — staying PENDING, will retry compensating next tick",
                event.getId(), event.getEventType());
        }
    }

    private void handleTransientError(OutboxEvent event, RuntimeException e) {
        event.recordAttemptFailure(e.toString());
        outboxEventRepository.save(event);
        if (event.getAttemptCount() >= ERROR_LOG_ESCALATION_ATTEMPTS) {
            log.error("FUND_OUTBOX_STUCK — outbox event {} ({}) has failed {} times in a row with a " +
                "non-client error (wallet-service down/timeout?) — still retrying every tick, no auto-give-up, " +
                "needs operator attention if this keeps climbing: {}",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
        } else {
            log.warn("outbox event {} ({}) failed with a transient error (attempt {}), retrying next tick: {}",
                event.getId(), event.getEventType(), event.getAttemptCount(), e.toString());
        }
    }

    private void compensate(OutboxEvent event, OutboxPayload payload) {
        switch (event.getEventType()) {
            case FUND_CONTRIBUTE_DEBIT ->
                mutationExecutor.compensateContribute(payload.fundId(), payload.amount(), payload.fundTransactionId());
            case FUND_WITHDRAW_CREDIT ->
                mutationExecutor.compensateWithdraw(payload.fundId(), payload.amount(), payload.fundTransactionId());
            case FUND_DISSOLVE_CREDIT ->
                mutationExecutor.compensateDissolve(payload.fundId(), payload.amount(), payload.fundTransactionId());
        }
    }

    private OutboxPayload readPayload(OutboxEvent event) {
        try {
            return objectMapper.readValue(event.getPayload(), OutboxPayload.class);
        } catch (JsonProcessingException e) {
            // Can't happen for a payload this service itself just wrote — if it somehow did, this
            // event can never be processed; fail loudly rather than looping forever on a payload
            // that will never parse.
            throw new IllegalStateException("Outbox event " + event.getId() + " has an unparseable payload", e);
        }
    }
}
