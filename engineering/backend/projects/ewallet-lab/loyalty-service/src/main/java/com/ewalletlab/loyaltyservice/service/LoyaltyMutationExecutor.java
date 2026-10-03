package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import com.ewalletlab.loyaltyservice.domain.LoyaltyAccount;
import com.ewalletlab.loyaltyservice.domain.PointEntry;
import com.ewalletlab.loyaltyservice.domain.PointEntryStatus;
import com.ewalletlab.loyaltyservice.repository.LoyaltyAccountRepository;
import com.ewalletlab.loyaltyservice.repository.PointEntryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * The {@code @Transactional} steps, separate from {@link LoyaltyService} so each runs in its own
 * transaction across a proxy boundary (same split as BnplMutationExecutor / LuckyMoneyMutationExecutor).
 *
 * <p><b>"Claim state first, move money after"</b> (mandatory per issue #19, lessons of #3/#8/#10):
 * {@link #claimRedemption} deducts the points and writes a PENDING redeem entry under the account
 * row lock, and commits BEFORE wallet-service's {@code /credit} is called. A concurrent redemption
 * re-reads the already-reduced balance, so the same points can never be paid out twice. If the
 * credit fails, {@link #revertRedemption} gives the points back.
 */
@Component
class LoyaltyMutationExecutor {

    private final LoyaltyAccountRepository accounts;
    private final PointEntryRepository entries;
    private final Clock clock;

    LoyaltyMutationExecutor(LoyaltyAccountRepository accounts, PointEntryRepository entries, Clock clock) {
        this.accounts = accounts;
        this.entries = entries;
        this.clock = clock;
    }

    /** Own transaction: a lost unique(user_id) race just rolls this one back and the caller re-reads. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    void createAccount(UUID userId) {
        accounts.saveAndFlush(new LoyaltyAccount(userId, Instant.now(clock)));
    }

    /**
     * Awards points for eligible wallet transactions not yet awarded (idempotent per transaction id)
     * and made at/after enrollment. Runs under the account row lock, so two concurrent syncs can't
     * both award the same transaction (the unique source_transaction_id is a second safety net).
     */
    @Transactional
    int syncEarned(UUID userId, List<WalletServiceClient.WalletTransaction> eligible, LoyaltyProperties.Tier tier,
                   LoyaltyCalculator calculator) {
        LoyaltyAccount account = lockOrThrow(userId);
        List<WalletServiceClient.WalletTransaction> candidates = eligible.stream()
            .filter(t -> !t.createdAt().isBefore(account.getEnrolledAt()))
            .toList();
        Set<UUID> done = entries.alreadyEarned(candidates.stream().map(WalletServiceClient.WalletTransaction::id).toList());
        int awarded = 0;
        for (WalletServiceClient.WalletTransaction t : candidates) {
            if (done.contains(t.id())) {
                continue;
            }
            long points = calculator.pointsFor(t.amount(), tier);
            entries.save(PointEntry.earn(account.getId(), points, t.amount(), t.id(), tier.name(), Instant.now(clock)));
            account.earn(points);
            awarded++;
        }
        return awarded;
    }

    @Transactional
    PointEntry claimRedemption(UUID userId, long points, LoyaltyCalculator calculator) {
        LoyaltyAccount account = lockOrThrow(userId);
        if (points > account.getPointsBalance()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Không đủ điểm (hiện có " + account.getPointsBalance() + " điểm)");
        }
        account.spend(points);
        return entries.save(PointEntry.pendingRedeem(account.getId(), points, calculator.cashbackFor(points), Instant.now(clock)));
    }

    @Transactional
    void completeRedemption(UUID entryId) {
        entries.findById(entryId).ifPresent(PointEntry::markCompleted);
    }

    @Transactional
    void revertRedemption(UUID userId, UUID entryId) {
        LoyaltyAccount account = lockOrThrow(userId);
        PointEntry entry = entries.findById(entryId).orElseThrow();
        if (entry.getStatus() != PointEntryStatus.PENDING) {
            return;
        }
        account.refund(entry.getPoints());
        entry.markFailed();
    }

    private LoyaltyAccount lockOrThrow(UUID userId) {
        return accounts.lockByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa có tài khoản điểm thưởng"));
    }
}
