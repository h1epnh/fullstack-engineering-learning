package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import com.ewalletlab.loyaltyservice.domain.DailyCheckin;
import com.ewalletlab.loyaltyservice.domain.LoyaltyAccount;
import com.ewalletlab.loyaltyservice.domain.LoyaltyMission;
import com.ewalletlab.loyaltyservice.domain.LoyaltyMissionCatalog;
import com.ewalletlab.loyaltyservice.domain.MissionStatus;
import com.ewalletlab.loyaltyservice.domain.PointEntry;
import com.ewalletlab.loyaltyservice.domain.UserMissionProgress;
import com.ewalletlab.loyaltyservice.repository.DailyCheckinRepository;
import com.ewalletlab.loyaltyservice.repository.LoyaltyAccountRepository;
import com.ewalletlab.loyaltyservice.repository.PointEntryRepository;
import com.ewalletlab.loyaltyservice.web.dto.CheckInResultDto;
import com.ewalletlab.loyaltyservice.web.dto.CheckInStatusDto;
import com.ewalletlab.loyaltyservice.web.dto.ClaimMissionResultDto;
import com.ewalletlab.loyaltyservice.web.dto.MissionDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Issue #19 — "Điểm thưởng": a MOCK in-house loyalty program. No real partner, brand or catalog
 * behind it; the only reward is cashback into the user's own main wallet.
 */
@Service
public class LoyaltyService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyService.class);

    private final LoyaltyAccountRepository accounts;
    private final PointEntryRepository entries;
    private final DailyCheckinRepository checkins;
    private final LoyaltyMutationExecutor executor;
    private final LoyaltyCalculator calculator;
    private final WalletServiceClient wallet;
    private final Clock clock;
    private final LoyaltyProperties props;

    public LoyaltyService(LoyaltyAccountRepository accounts, PointEntryRepository entries,
                          DailyCheckinRepository checkins, LoyaltyMutationExecutor executor,
                          LoyaltyCalculator calculator, WalletServiceClient wallet, Clock clock, LoyaltyProperties props) {
        this.accounts = accounts;
        this.entries = entries;
        this.checkins = checkins;
        this.executor = executor;
        this.calculator = calculator;
        this.wallet = wallet;
        this.clock = clock;
        this.props = props;
    }

    public record Snapshot(
        LoyaltyAccount account, LoyaltyProperties.Tier tier, Optional<LoyaltyProperties.Tier> nextTier,
        BigDecimal qualifyingSpend, Instant windowStart, boolean synced, List<PointEntry> history) {
    }

    /**
     * Reads always sync first: the wallet ledger is fetched OUTSIDE any DB transaction/lock (no
     * network call while holding a row lock), then newly eligible transactions are awarded under
     * the lock. If wallet-service is unreachable the last stored balance is returned with
     * {@code synced=false} rather than failing the whole screen.
     */
    public Snapshot get(UUID userId) {
        ensureAccount(userId);
        Sync sync = sync(userId);
        LoyaltyAccount account = accounts.findByUserId(userId).orElseThrow();
        return new Snapshot(account, sync.tier(), calculator.nextTier(sync.tier()), sync.spend(), sync.windowStart(),
            sync.synced(), entries.findByAccountIdOrderByCreatedAtDesc(account.getId()));
    }

    private record Sync(LoyaltyProperties.Tier tier, BigDecimal spend, Instant windowStart, boolean synced) {
    }

    private Sync sync(UUID userId) {
        Instant windowStart = calculator.windowStart(ZonedDateTime.now(clock));
        try {
            List<WalletServiceClient.WalletTransaction> eligible = wallet.transactions(userId).stream()
                .filter(t -> LoyaltyCalculator.ELIGIBLE_TYPES.contains(t.type()))
                .toList();
            BigDecimal spend = eligible.stream().filter(t -> !t.createdAt().isBefore(windowStart))
                .map(WalletServiceClient.WalletTransaction::amount).reduce(BigDecimal.ZERO, BigDecimal::add);
            LoyaltyProperties.Tier tier = calculator.tierFor(spend);
            executor.syncEarned(userId, eligible, tier, calculator);
            return new Sync(tier, spend, windowStart, true);
        } catch (RestClientException e) {
            log.warn("wallet-service unreachable while syncing loyalty points for user={}: {}", userId, e.getMessage());
            return new Sync(calculator.tierFor(BigDecimal.ZERO), BigDecimal.ZERO, windowStart, false);
        }
    }

    /** Claim (points deducted + PENDING, committed) → real wallet-service credit → COMPLETED. */
    public Snapshot redeem(UUID userId, long points) {
        if (points < calculator.minRedeemPoints()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cần đổi tối thiểu " + calculator.minRedeemPoints() + " điểm");
        }
        ensureAccount(userId);
        sync(userId); // award anything newly eligible first, so the balance being claimed is current
        PointEntry claimed = executor.claimRedemption(userId, points, calculator);
        try {
            wallet.creditRedemption(userId, claimed.getAmountVnd(), claimed.getId());
        } catch (RuntimeException e) {
            executor.revertRedemption(userId, claimed.getId());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Không cộng được tiền vào ví chính, điểm đã được hoàn lại", e);
        }
        executor.completeRedemption(claimed.getId());
        return get(userId);
    }

    /** Issue #38 — "Điểm danh mỗi ngày". {@code today} computed via the injected {@code Clock}
     * (already {@code Clock.system(props.zone())} — Asia/Ho_Chi_Minh per the ticket's Constraint),
     * not {@code LocalDate.now()} (server default zone, which the Constraint explicitly says NOT
     * to use). */
    public CheckInResultDto checkIn(UUID userId) {
        ensureAccount(userId);
        DailyCheckin result = executor.checkInOnce(userId, LocalDate.now(clock));
        long balance = accounts.findByUserId(userId).orElseThrow().getPointsBalance();
        return new CheckInResultDto(result.getPointsAwarded(), result.getStreakDay(), balance);
    }

    public CheckInStatusDto checkInStatus(UUID userId) {
        ensureAccount(userId);
        LocalDate today = LocalDate.now(clock);
        Optional<DailyCheckin> todayCheckin = checkins.findByUserIdAndCheckinDate(userId, today);
        if (todayCheckin.isPresent()) {
            return new CheckInStatusDto(true, todayCheckin.get().getStreakDay(), today);
        }
        DailyCheckin previous = checkins.findTopByUserIdOrderByCheckinDateDesc(userId).orElse(null);
        int projectedStreakDay = CheckinCalculator.nextStreakDay(
            previous == null ? null : previous.getCheckinDate(),
            previous == null ? 0 : previous.getStreakDay(),
            today);
        return new CheckInStatusDto(false, projectedStreakDay, previous == null ? null : previous.getCheckinDate());
    }

    /**
     * Issue #38 — "Nhiệm vụ hàng ngày". Completion is detected lazily by scanning TODAY's
     * wallet-service transactions for each mission's {@code requiredTransactionType} (same
     * "fetch outside any lock, upsert status under a lock" shape as {@link #sync} uses for tier
     * sync) — not an event/webhook from the other services, consistent with this service calling
     * {@code wallet.transactions(userId)} already for #19's own sync. Unreachable wallet-service
     * fails OPEN here (missions just stay whatever they already were — same precedent as {@link
     * #sync}'s {@code synced=false} path), never fails the whole screen.
     */
    public List<MissionDto> missions(UUID userId) {
        ensureAccount(userId);
        LocalDate today = LocalDate.now(clock);
        List<WalletServiceClient.WalletTransaction> todaysTransactions = todaysTransactions(userId, today);
        return LoyaltyMissionCatalog.MISSIONS.stream()
            .filter(LoyaltyMission::active)
            .map(mission -> {
                boolean qualifies = todaysTransactions.stream().anyMatch(t -> t.type().equals(mission.requiredTransactionType()));
                UserMissionProgress progress = executor.upsertMissionProgress(userId, mission.code(), today, qualifies);
                return MissionDto.of(mission, progress.getStatus());
            })
            .toList();
    }

    public ClaimMissionResultDto claimMission(UUID userId, String missionCode) {
        LoyaltyMission mission = LoyaltyMissionCatalog.findByCode(missionCode)
            .filter(LoyaltyMission::active)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhiệm vụ này"));
        ensureAccount(userId);
        LocalDate today = LocalDate.now(clock);
        // Re-check completion fresh (same reasoning as redeem() re-syncing before claiming) —
        // the caller's last GET /missions might be stale if the qualifying transaction only just
        // landed, or if missions() was never called yet today at all for this user.
        List<WalletServiceClient.WalletTransaction> todaysTransactions = todaysTransactions(userId, today);
        boolean qualifies = todaysTransactions.stream().anyMatch(t -> t.type().equals(mission.requiredTransactionType()));
        executor.upsertMissionProgress(userId, mission.code(), today, qualifies);
        PointEntry claimed = executor.claimMissionOnce(userId, mission, today);
        long balance = accounts.findByUserId(userId).orElseThrow().getPointsBalance();
        return new ClaimMissionResultDto(mission.code(), (int) claimed.getPoints(), balance);
    }

    private List<WalletServiceClient.WalletTransaction> todaysTransactions(UUID userId, LocalDate today) {
        try {
            return wallet.transactions(userId).stream()
                .filter(t -> t.createdAt().atZone(props.zone()).toLocalDate().equals(today))
                .toList();
        } catch (RestClientException e) {
            log.warn("wallet-service unreachable while checking today's missions for user={}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    private void ensureAccount(UUID userId) {
        if (accounts.findByUserId(userId).isPresent()) {
            return;
        }
        try {
            executor.createAccount(userId);
        } catch (DataIntegrityViolationException e) {
            // A concurrent first request created it — fine, it exists now.
        }
    }
}
