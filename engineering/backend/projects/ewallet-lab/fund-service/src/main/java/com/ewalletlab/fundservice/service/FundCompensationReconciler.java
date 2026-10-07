package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.FundCompensationFailure;
import com.ewalletlab.fundservice.domain.FundTransactionType;
import com.ewalletlab.fundservice.repository.FundCompensationFailureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Issue #14 — background safety net for the "tiền kẹt mid-flight" bug class agent-tester found at
 * ≥60 concurrent withdraws on one fund (see {@link FundCompensationFailure}'s javadoc and {@code
 * FundService.compensateWithRetry} for the full chain of events). A row in {@code
 * fund_compensation_failures} means a withdraw/dissolve's compensation step lost EVERY one of its
 * (already much larger than normal) optimistic-lock retry attempts against {@code Fund}'s {@code
 * @Version} — the fund's balance is still decremented and the phantom {@code FundTransaction} row
 * is still sitting in the ledger, with no wallet-service credit to show for it.
 *
 * <p>Deliberately simple: a single plain attempt per unresolved row, once per scheduled run, with
 * no internal retry loop of its own. The contention that exhausted {@code compensateWithRetry}'s
 * 30 attempts in the first place is, in practice, a short-lived burst (dozens of concurrent
 * requests on the SAME fund, all finishing within a few seconds) — by the time this job runs
 * again (every {@value #FIXED_DELAY_MILLIS}ms), that burst has almost always cleared, so a single
 * attempt here is enough; if it isn't, the row just stays unresolved for the next run to try
 * again, with no risk of this job itself piling up retries under load the way the original bug
 * did.
 */
@Component
class FundCompensationReconciler {

    private static final Logger log = LoggerFactory.getLogger(FundCompensationReconciler.class);
    private static final long FIXED_DELAY_MILLIS = 15_000;

    private final FundCompensationFailureRepository failureRepository;
    private final FundMutationExecutor mutationExecutor;

    FundCompensationReconciler(FundCompensationFailureRepository failureRepository, FundMutationExecutor mutationExecutor) {
        this.failureRepository = failureRepository;
        this.mutationExecutor = mutationExecutor;
    }

    @Scheduled(fixedDelay = FIXED_DELAY_MILLIS, initialDelay = FIXED_DELAY_MILLIS)
    void reconcile() {
        List<FundCompensationFailure> pending = failureRepository.findByResolvedAtIsNull();
        for (FundCompensationFailure failure : pending) {
            attemptOnce(failure);
        }
    }

    private void attemptOnce(FundCompensationFailure failure) {
        try {
            if (failure.getAction() == FundTransactionType.DISSOLVE) {
                mutationExecutor.compensateDissolve(failure.getFundId(), failure.getAmount(), failure.getTransactionId());
            } else {
                mutationExecutor.compensateWithdraw(failure.getFundId(), failure.getAmount(), failure.getTransactionId());
            }
            failure.markResolved(Instant.now());
            failureRepository.save(failure);
            log.warn("FUND_MONEY_STUCK resolved by background reconciler — fund={} transactionId={} amount={} " +
                "action={} failureId={}", failure.getFundId(), failure.getTransactionId(), failure.getAmount(),
                failure.getAction(), failure.getId());
        } catch (ObjectOptimisticLockingFailureException e) {
            log.error("FUND_MONEY_STUCK still unresolved after another reconciler attempt (fund row still " +
                "contended) — fund={} transactionId={} amount={} action={} failureId={} — will retry on the " +
                "next scheduled run", failure.getFundId(), failure.getTransactionId(), failure.getAmount(),
                failure.getAction(), failure.getId());
        } catch (RuntimeException e) {
            log.error("FUND_MONEY_STUCK reconciler attempt failed unexpectedly (not a lock conflict) — " +
                "fund={} transactionId={} amount={} action={} failureId={} — {} — needs manual investigation",
                failure.getFundId(), failure.getTransactionId(), failure.getAmount(), failure.getAction(),
                failure.getId(), e.toString());
        }
    }
}
