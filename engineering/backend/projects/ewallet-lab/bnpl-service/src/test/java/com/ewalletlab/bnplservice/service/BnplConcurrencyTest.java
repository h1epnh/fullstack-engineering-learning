package com.ewalletlab.bnplservice.service;

import com.ewalletlab.bnplservice.domain.RepaymentStatus;
import com.ewalletlab.bnplservice.repository.RepaymentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
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

/**
 * Issue #18's mandatory race test (≥10 concurrent repayments/draws on one credit line), run against
 * the real service + JPA + row locks, with only wallet-service mocked. The mocked debit sleeps, so
 * every concurrent request is genuinely in flight while the first one's money is "moving".
 */
@SpringBootTest
@ActiveProfiles("test")
class BnplConcurrencyTest {

    private static final int THREADS = 12;

    @Autowired
    BnplService service;

    @Autowired
    RepaymentRepository repayments;

    @MockitoBean
    WalletServiceClient wallet;

    @Test
    void concurrentFullRepaymentsDebitTheWalletExactlyOnce() throws Exception {
        UUID user = UUID.randomUUID();
        service.open(user, true);
        service.draw(user, new BigDecimal("1000000"), "Mua sắm");
        BigDecimal total = service.get(user).orElseThrow().totalDue();
        assertThat(total).isEqualByComparingTo("1033000");

        when(wallet.debitRepayment(eq(user), any(), any())).thenAnswer(inv -> {
            Thread.sleep(150);
            return new WalletServiceClient.WalletResult(user, BigDecimal.ZERO);
        });

        Outcome o = race(() -> service.repay(user, total));

        assertThat(o.ok.get()).isEqualTo(1);
        assertThat(o.rejected.get()).isEqualTo(THREADS - 1);
        assertThat(o.unexpected).isEmpty();
        verify(wallet, times(1)).debitRepayment(eq(user), any(), any());
        var snap = service.get(user).orElseThrow();
        assertThat(snap.totalDue()).isEqualByComparingTo("0");
        assertThat(snap.creditLine().getAvailableLimit()).isEqualByComparingTo("20000000");
    }

    @Test
    void concurrentPartialRepaymentsNeverOverpay() throws Exception {
        UUID user = UUID.randomUUID();
        service.open(user, true);
        service.draw(user, new BigDecimal("267000"), "Mua sắm"); // total due 300.000
        when(wallet.debitRepayment(eq(user), any(), any())).thenAnswer(inv -> {
            Thread.sleep(50);
            return new WalletServiceClient.WalletResult(user, BigDecimal.ZERO);
        });

        // 12 × 100.000 against 300.000 owed → exactly 3 succeed.
        Outcome o = race(() -> service.repay(user, new BigDecimal("100000")));

        assertThat(o.ok.get()).isEqualTo(3);
        assertThat(o.unexpected).isEmpty();
        verify(wallet, times(3)).debitRepayment(eq(user), any(), any());
        assertThat(service.get(user).orElseThrow().totalDue()).isEqualByComparingTo("0");
    }

    @Test
    void concurrentDrawsNeverExceedTheLimit() throws Exception {
        UUID user = UUID.randomUUID();
        service.open(user, true);

        // 12 × 3.000.000 against a 20.000.000 limit → exactly 6 succeed.
        Outcome o = race(() -> service.draw(user, new BigDecimal("3000000"), "Mua sắm"));

        assertThat(o.ok.get()).isEqualTo(6);
        assertThat(o.unexpected).isEmpty();
        var line = service.get(user).orElseThrow().creditLine();
        assertThat(line.getOutstandingPrincipal()).isEqualByComparingTo("18000000");
        assertThat(service.get(user).orElseThrow().draws()).hasSize(6);
    }

    @Test
    void failedWalletDebitRevertsTheClaim() {
        UUID user = UUID.randomUUID();
        service.open(user, true);
        service.draw(user, new BigDecimal("1000000"), "Mua sắm");
        when(wallet.debitRepayment(eq(user), any(), any())).thenThrow(HttpClientErrorException.create(
            HttpStatus.CONFLICT, "Conflict", HttpHeaders.EMPTY, "Số dư không đủ".getBytes(StandardCharsets.UTF_8),
            StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.repay(user, new BigDecimal("500000")))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Số dư không đủ");

        var snap = service.get(user).orElseThrow();
        assertThat(snap.totalDue()).isEqualByComparingTo("1033000");
        assertThat(snap.creditLine().getOutstandingPrincipal()).isEqualByComparingTo("1000000");
        assertThat(snap.repayments()).singleElement().extracting(r -> r.getStatus()).isEqualTo(RepaymentStatus.FAILED);
    }

    @Test
    void openRequiresDisclaimerAndIsOnce() {
        UUID user = UUID.randomUUID();
        assertThatThrownBy(() -> service.open(user, false)).isInstanceOf(ResponseStatusException.class);
        assertThat(service.get(user)).isEmpty();
        service.open(user, true);
        assertThatThrownBy(() -> service.open(user, true)).isInstanceOf(ResponseStatusException.class);
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
                    if (e.getStatusCode().is4xxClientError()) {
                        o.rejected.incrementAndGet();
                    } else {
                        o.unexpected.add(e);
                    }
                } catch (Throwable t) {
                    o.unexpected.add(t);
                }
                return null;
            }));
        }
        start.countDown();
        for (Future<?> f : futures) {
            f.get(60, TimeUnit.SECONDS);
        }
        pool.shutdown();
        return o;
    }
}
