package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.domain.PointEntryKind;
import com.ewalletlab.loyaltyservice.domain.PointEntryStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/** Issue #19's mandatory race test (≥10 concurrent redemptions on one account) + sync idempotency. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class LoyaltyConcurrencyTest {

    private static final int THREADS = 12;

    @Autowired
    LoyaltyService service;

    @MockitoBean
    WalletServiceClient wallet;

    @org.springframework.boot.test.web.server.LocalServerPort
    int port;

    private static WalletServiceClient.WalletTransaction tx(String type, String amount) {
        return new WalletServiceClient.WalletTransaction(UUID.randomUUID(), type, new BigDecimal(amount), Instant.now().plusSeconds(1));
    }

    /** Opens the account (enrolledAt = now), then makes the wallet ledger return {@code txs}. */
    private UUID userWith(List<WalletServiceClient.WalletTransaction> txs) {
        UUID user = UUID.randomUUID();
        when(wallet.transactions(user)).thenReturn(List.of());
        service.get(user);
        when(wallet.transactions(user)).thenReturn(txs);
        return user;
    }

    @Test
    void onlyBillPaymentsAfterEnrollmentEarnAndSyncIsIdempotentUnderConcurrency() throws Exception {
        UUID user = UUID.randomUUID();
        var before = new WalletServiceClient.WalletTransaction(UUID.randomUUID(), "BILL_PAYMENT", new BigDecimal("500000"),
            Instant.now().minusSeconds(3600));
        when(wallet.transactions(user)).thenReturn(List.of(before));
        assertThat(service.get(user).account().getPointsBalance()).isZero(); // pre-enrollment: no points

        when(wallet.transactions(user)).thenReturn(List.of(before,
            tx("BILL_PAYMENT", "1250000"), tx("TRANSFER_OUT", "9000000"), tx("WITHDRAW", "9000000"), tx("TOPUP", "9000000")));
        Outcome o = race(() -> service.get(user));
        assertThat(o.unexpected).isEmpty();

        var snap = service.get(user);
        assertThat(snap.account().getPointsBalance()).isEqualTo(125); // 1.250.000 / 10.000, base tier
        assertThat(snap.history()).filteredOn(e -> e.getKind() == PointEntryKind.EARN).hasSize(1);
    }

    @Test
    void concurrentFullRedemptionsCreditTheWalletExactlyOnce() throws Exception {
        UUID user = userWith(List.of(tx("BILL_PAYMENT", "3000000"))); // 300 points
        assertThat(service.get(user).account().getPointsBalance()).isEqualTo(300);
        when(wallet.creditRedemption(eq(user), any(), any())).thenAnswer(inv -> {
            Thread.sleep(150);
            return new WalletServiceClient.WalletResult(user, BigDecimal.ZERO);
        });

        Outcome o = race(() -> service.redeem(user, 300));

        assertThat(o.ok.get()).isEqualTo(1);
        assertThat(o.rejected.get()).isEqualTo(THREADS - 1);
        assertThat(o.unexpected).isEmpty();
        verify(wallet, times(1)).creditRedemption(eq(user), eq(new BigDecimal("30000")), any());
        assertThat(service.get(user).account().getPointsBalance()).isZero();
    }

    @Test
    void concurrentPartialRedemptionsNeverOverspend() throws Exception {
        UUID user = userWith(List.of(tx("BILL_PAYMENT", "3500000"))); // 350 points
        when(wallet.creditRedemption(eq(user), any(), any())).thenReturn(new WalletServiceClient.WalletResult(user, BigDecimal.ZERO));

        Outcome o = race(() -> service.redeem(user, 100)); // 12 × 100 vs 350 → 3 succeed

        assertThat(o.ok.get()).isEqualTo(3);
        assertThat(o.unexpected).isEmpty();
        verify(wallet, times(3)).creditRedemption(eq(user), any(), any());
        assertThat(service.get(user).account().getPointsBalance()).isEqualTo(50);
    }

    @Test
    void failedCreditGivesThePointsBack() {
        UUID user = userWith(List.of(tx("BILL_PAYMENT", "2000000"))); // 200 points
        when(wallet.creditRedemption(eq(user), any(), any())).thenThrow(new ResourceAccessException("down"));

        assertThatThrownBy(() -> service.redeem(user, 200)).isInstanceOf(ResponseStatusException.class);

        var snap = service.get(user);
        assertThat(snap.account().getPointsBalance()).isEqualTo(200);
        assertThat(snap.history()).filteredOn(e -> e.getKind() == PointEntryKind.REDEEM)
            .singleElement().extracting(e -> e.getStatus()).isEqualTo(PointEntryStatus.FAILED);
    }

    @Test
    void belowMinimumAndWalletDownAreHandled() {
        UUID user = userWith(List.of(tx("BILL_PAYMENT", "2000000")));
        assertThatThrownBy(() -> service.redeem(user, 99)).isInstanceOf(ResponseStatusException.class);
        when(wallet.transactions(user)).thenThrow(new ResourceAccessException("down"));
        var snap = service.get(user);
        assertThat(snap.synced()).isFalse();
    }

    /**
     * Same race through the real HTTP stack (request-scoped persistence context, controller,
     * exception mapping). The service-level tests above can't catch open-in-view problems — this one
     * returned raw 500s under contention before open-in-view was turned off.
     */
    @Test
    void httpConcurrentRedemptionsNeverReturnServerErrors() throws Exception {
        UUID user = userWith(List.of(tx("BILL_PAYMENT", "3000000"))); // 300 points
        service.get(user);
        when(wallet.creditRedemption(eq(user), any(), any())).thenAnswer(inv -> {
            Thread.sleep(100);
            return new WalletServiceClient.WalletResult(user, BigDecimal.ZERO);
        });
        var client = java.net.http.HttpClient.newHttpClient();
        var request = java.net.http.HttpRequest.newBuilder(
                java.net.URI.create("http://localhost:" + port + "/loyalty/" + user + "/redemptions"))
            .header("Content-Type", "application/json")
            .POST(java.net.http.HttpRequest.BodyPublishers.ofString("{\"points\":300}"))
            .build();
        List<Integer> statuses = new CopyOnWriteArrayList<>();
        race(() -> statuses.add(client.send(request, java.net.http.HttpResponse.BodyHandlers.discarding()).statusCode()));

        assertThat(statuses).hasSize(THREADS).allMatch(st -> st == 200 || st == 409);
        assertThat(statuses).filteredOn(st -> st == 200).hasSize(1);
        verify(wallet, times(1)).creditRedemption(eq(user), any(), any());
    }

    /** Issue #38's mandatory race test: ≥10 concurrent check-ins for the same user on the same day
     * → exactly 1 succeeds (points awarded once), the rest get a clean 409 — see {@code
     * LoyaltyMutationExecutor#checkInOnce}'s javadoc for why the account's pessimistic lock
     * (already used by every other mutation in this service) is what actually guarantees this,
     * not luck. */
    @Test
    void concurrentCheckInsAwardPointsExactlyOnce() throws Exception {
        UUID user = UUID.randomUUID();

        Outcome o = race(() -> service.checkIn(user));

        assertThat(o.ok.get()).isEqualTo(1);
        assertThat(o.rejected.get()).isEqualTo(THREADS - 1);
        assertThat(o.unexpected).isEmpty();
        assertThat(service.get(user).account().getPointsBalance()).isEqualTo(CheckinCalculator.BASE_POINTS);
        var status = service.checkInStatus(user);
        assertThat(status.checkedInToday()).isTrue();
        assertThat(status.currentStreakDay()).isEqualTo(1);
    }

    private record Outcome(AtomicInteger ok, AtomicInteger rejected, List<Throwable> unexpected) {
    }

    private Outcome race(Callable<?> task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(THREADS);
        CountDownLatch start = new CountDownLatch(1);
        Outcome o = new Outcome(new AtomicInteger(), new AtomicInteger(), new CopyOnWriteArrayList<>());
        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < THREADS; i++) {
            futures.add(pool.submit(() -> {
                start.await();
                try {
                    task.call();
                    o.ok.incrementAndGet();
                } catch (ResponseStatusException e) {
                    if (e.getStatusCode().is4xxClientError()) o.rejected.incrementAndGet();
                    else o.unexpected.add(e);
                } catch (Throwable t) {
                    o.unexpected.add(t);
                }
                return null;
            }));
        }
        start.countDown();
        for (Future<?> f : futures) f.get(60, TimeUnit.SECONDS);
        pool.shutdown();
        return o;
    }
}
