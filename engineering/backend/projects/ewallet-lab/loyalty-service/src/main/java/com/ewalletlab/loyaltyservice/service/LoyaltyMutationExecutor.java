package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import com.ewalletlab.loyaltyservice.domain.DailyCheckin;
import com.ewalletlab.loyaltyservice.domain.LoyaltyAccount;
import com.ewalletlab.loyaltyservice.domain.LoyaltyMission;
import com.ewalletlab.loyaltyservice.domain.MissionStatus;
import com.ewalletlab.loyaltyservice.domain.PointEntry;
import com.ewalletlab.loyaltyservice.domain.PointEntryStatus;
import com.ewalletlab.loyaltyservice.domain.UserMissionProgress;
import com.ewalletlab.loyaltyservice.repository.DailyCheckinRepository;
import com.ewalletlab.loyaltyservice.repository.LoyaltyAccountRepository;
import com.ewalletlab.loyaltyservice.repository.PointEntryRepository;
import com.ewalletlab.loyaltyservice.repository.UserMissionProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
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
    private final DailyCheckinRepository checkins;
    private final UserMissionProgressRepository missionProgress;
    private final Clock clock;

    LoyaltyMutationExecutor(LoyaltyAccountRepository accounts, PointEntryRepository entries,
                             DailyCheckinRepository checkins, UserMissionProgressRepository missionProgress,
                             Clock clock) {
        this.accounts = accounts;
        this.entries = entries;
        this.checkins = checkins;
        this.missionProgress = missionProgress;
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

    /**
     * Issue #38 — "Điểm danh mỗi ngày". Runs under the SAME account row lock as every other
     * mutation here ({@code lockByUserId}), so concurrent check-ins for one user are fully
     * serialized: the loser's transaction re-reads this method's own {@code
     * findByUserIdAndCheckinDate} AFTER the winner has already committed its row, and sees it —
     * the 409 below is reached by every request but the first, every time, not by luck. The
     * {@code UNIQUE(user_id, checkin_date)} constraint is kept as a second, independent safety net
     * (defense in depth per the ticket's explicit requirement), not the primary mechanism.
     */
    @Transactional
    DailyCheckin checkInOnce(UUID userId, LocalDate today) {
        LoyaltyAccount account = lockOrThrow(userId);
        if (checkins.findByUserIdAndCheckinDate(userId, today).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã điểm danh hôm nay rồi");
        }
        DailyCheckin previous = checkins.findTopByUserIdOrderByCheckinDateDesc(userId).orElse(null);
        int streakDay = CheckinCalculator.nextStreakDay(
            previous == null ? null : previous.getCheckinDate(),
            previous == null ? 0 : previous.getStreakDay(),
            today);
        int points = CheckinCalculator.pointsForStreakDay(streakDay);
        DailyCheckin checkin = checkins.save(new DailyCheckin(userId, today, points, streakDay, Instant.now(clock)));
        account.earn(points);
        entries.save(PointEntry.earn(account.getId(), points, BigDecimal.ZERO, null, "CHECK_IN_DAY_" + streakDay, Instant.now(clock)));
        return checkin;
    }

    /**
     * Issue #38 — reads/creates today's {@link UserMissionProgress} row for one mission, upserting
     * it to {@code COMPLETED} if {@code qualifyingTransactionFoundToday} is true and it's still
     * {@code IN_PROGRESS}. Called from a READ path ({@code LoyaltyService#missions}), not wrapped
     * in the account lock (no points move here, just a lazy status upsert) — same "lazy-compute on
     * read" shape lucky-money-service's expiry check uses, not a background job.
     */
    @Transactional
    UserMissionProgress upsertMissionProgress(UUID userId, String missionCode, LocalDate today,
                                               boolean qualifyingTransactionFoundToday) {
        UserMissionProgress progress = missionProgress.findByUserIdAndMissionCodeAndTargetDate(userId, missionCode, today)
            .orElseGet(() -> missionProgress.save(new UserMissionProgress(userId, missionCode, today)));
        if (qualifyingTransactionFoundToday) {
            progress.markCompleted(Instant.now(clock));
        }
        return progress;
    }

    /**
     * Issue #38 — "Nhận điểm" nhiệm vụ. Runs under the account lock (same reasoning as {@link
     * #checkInOnce}): re-reads {@code UserMissionProgress} fresh after acquiring the lock, so 2
     * concurrent claims for the same mission/day can't both award points — the loser sees {@code
     * CLAIMED} already and gets a clean 409.
     */
    @Transactional
    PointEntry claimMissionOnce(UUID userId, LoyaltyMission mission, LocalDate today) {
        LoyaltyAccount account = lockOrThrow(userId);
        UserMissionProgress progress = missionProgress.findByUserIdAndMissionCodeAndTargetDate(userId, mission.code(), today)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Nhiệm vụ hôm nay chưa hoàn thành"));
        if (progress.getStatus() == MissionStatus.CLAIMED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhiệm vụ này đã được nhận điểm hôm nay rồi");
        }
        if (progress.getStatus() != MissionStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhiệm vụ hôm nay chưa hoàn thành");
        }
        progress.markClaimed(Instant.now(clock));
        account.earn(mission.rewardPoints());
        return entries.save(PointEntry.earn(account.getId(), mission.rewardPoints(), BigDecimal.ZERO, null,
            "MISSION_" + mission.code(), Instant.now(clock)));
    }

    private LoyaltyAccount lockOrThrow(UUID userId) {
        return accounts.lockByUserId(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chưa có tài khoản điểm thưởng"));
    }
}
