package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.config.LoyaltyProperties;
import com.ewalletlab.loyaltyservice.domain.LoyaltyAccount;
import com.ewalletlab.loyaltyservice.domain.PointEntry;
import com.ewalletlab.loyaltyservice.repository.LoyaltyAccountRepository;
import com.ewalletlab.loyaltyservice.repository.PointEntryRepository;
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
    private final LoyaltyMutationExecutor executor;
    private final LoyaltyCalculator calculator;
    private final WalletServiceClient wallet;
    private final Clock clock;

    public LoyaltyService(LoyaltyAccountRepository accounts, PointEntryRepository entries, LoyaltyMutationExecutor executor,
                          LoyaltyCalculator calculator, WalletServiceClient wallet, Clock clock) {
        this.accounts = accounts;
        this.entries = entries;
        this.executor = executor;
        this.calculator = calculator;
        this.wallet = wallet;
        this.clock = clock;
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
