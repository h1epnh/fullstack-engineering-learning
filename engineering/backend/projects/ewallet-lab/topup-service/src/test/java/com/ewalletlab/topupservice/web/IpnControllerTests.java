package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.domain.OutboxEvent;
import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.BankTransferOutRequestRepository;
import com.ewalletlab.topupservice.repository.OutboxEventRepository;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import com.ewalletlab.topupservice.service.BankGatewayClient;
import com.ewalletlab.topupservice.service.IpnSignatureVerifier;
import com.ewalletlab.topupservice.service.TopupService;
import com.ewalletlab.topupservice.service.WalletServiceClient;
import com.ewalletlab.topupservice.web.dto.IpnRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static com.ewalletlab.topupservice.web.IpnTestSupport.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class IpnControllerTests {

    private final TopupRequestRepository repo = mock(TopupRequestRepository.class);
    private final OutboxEventRepository outboxRepo = mock(OutboxEventRepository.class);
    private final BankGatewayClient bankGateway = mock(BankGatewayClient.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final BankTransferOutRequestRepository outRepo = mock(BankTransferOutRequestRepository.class);
    private final WalletServiceClient wallet = mock(WalletServiceClient.class);
    private TopupService topupService;
    private IpnController topup;
    private BankTransferOutIpnController out;
    private TopupRequest pending;
    private final UUID user = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        IpnSignatureVerifier v = new IpnSignatureVerifier(ACCESS_KEY, SECRET, 300);
        topupService = new TopupService(repo, bankGateway, wallet, outboxRepo, objectMapper);
        topup = new IpnController(repo, topupService, v);
        out = new BankTransferOutIpnController(outRepo, wallet, v);
        pending = new TopupRequest("ord-1", user, new BigDecimal("50000"));
        when(repo.findByOrderId("ord-1")).thenReturn(Optional.of(pending));
        // Fake of the atomic conditional UPDATE: exactly one caller flips PENDING; others get 0.
        when(repo.transitionFromPending(eq("ord-1"), any())).thenAnswer(inv -> {
            synchronized (pending) {
                if (pending.getStatus() != TopupStatus.PENDING) return 0;
                pending.markStatus(inv.getArgument(1));
                return 1;
            }
        });
    }

    private long now() {
        return System.currentTimeMillis();
    }

    @Test
    void validSignatureConfirmsAndPublishesOnce_replayDoesNotCreditTwice() {
        IpnRequest ipn = signed("ord-1", 50000, 0, now(), SECRET);
        assertEquals(HttpStatus.NO_CONTENT, topup.handleIpn(ipn).getStatusCode());
        assertEquals(TopupStatus.CONFIRMED, pending.getStatus());
        // replay of the same valid IPN inside the window
        assertEquals(HttpStatus.NO_CONTENT, topup.handleIpn(ipn).getStatusCode());
        verify(outboxRepo, times(1)).save(any(OutboxEvent.class));
    }

    @Test
    void wrongSignatureRejected_noStateChange() {
        IpnRequest forged = signed("ord-1", 50000, 0, now(), "attacker-guess");
        assertEquals(HttpStatus.UNAUTHORIZED, topup.handleIpn(forged).getStatusCode());
        assertEquals(TopupStatus.PENDING, pending.getStatus());
        verifyNoInteractions(outboxRepo);
        verify(repo, never()).transitionFromPending(anyString(), any());
    }

    @Test
    void missingSignatureRejected() {
        IpnRequest noSig = withSignature(signed("ord-1", 50000, 0, now(), SECRET), null);
        assertEquals(HttpStatus.UNAUTHORIZED, topup.handleIpn(noSig).getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, topup.handleIpn(withSignature(noSig, "")).getStatusCode());
        verifyNoInteractions(outboxRepo);
    }

    @Test
    void tamperedAmountWithOldSignatureRejected() {
        IpnRequest good = signed("ord-1", 1000, 0, now(), SECRET);
        IpnRequest tampered = new IpnRequest(good.partnerCode(), good.orderId(), good.requestId(), 50000, good.orderInfo(),
            good.orderType(), good.transId(), good.resultCode(), good.message(), good.payType(), good.responseTime(),
            good.extraData(), good.signature());
        assertEquals(HttpStatus.UNAUTHORIZED, topup.handleIpn(tampered).getStatusCode());
        verifyNoInteractions(outboxRepo);
    }

    @Test
    void validlySignedButAmountMismatchRejected() {
        IpnRequest ipn = signed("ord-1", 999999, 0, now(), SECRET);
        assertEquals(HttpStatus.BAD_REQUEST, topup.handleIpn(ipn).getStatusCode());
        assertEquals(TopupStatus.PENDING, pending.getStatus());
        verifyNoInteractions(outboxRepo);
    }

    @Test
    void staleIpnOutsideWindowRejected() {
        IpnRequest old = signed("ord-1", 50000, 0, now() - 10 * 60 * 1000L, SECRET);
        assertEquals(HttpStatus.UNAUTHORIZED, topup.handleIpn(old).getStatusCode());
        assertEquals(TopupStatus.PENDING, pending.getStatus());
        verifyNoInteractions(outboxRepo);
    }

    @Test
    void failedResultCodeMarksFailedWithoutPublishing() {
        IpnRequest ipn = signed("ord-1", 50000, 1000, now(), SECRET);
        assertEquals(HttpStatus.NO_CONTENT, topup.handleIpn(ipn).getStatusCode());
        assertEquals(TopupStatus.FAILED, pending.getStatus());
        verifyNoInteractions(outboxRepo);
    }

    @Test
    void bankTransferOut_forgedSignatureRejected_validRefundsOnceOnFailure() {
        BankTransferOutRequest req = new BankTransferOutRequest("out-1", user, "VCB", "123", new BigDecimal("20000"));
        when(outRepo.findByOrderId("out-1")).thenReturn(Optional.of(req));
        when(outRepo.transitionFromPending(eq("out-1"), any())).thenAnswer(inv -> {
            synchronized (req) {
                if (req.getStatus() != TopupStatus.PENDING) return 0;
                req.markStatus(inv.getArgument(1));
                return 1;
            }
        });

        assertEquals(HttpStatus.UNAUTHORIZED,
            out.handleIpn(signed("out-1", 20000, 1000, now(), "bad")).getStatusCode());
        assertEquals(TopupStatus.PENDING, req.getStatus());
        verifyNoInteractions(wallet);

        assertEquals(HttpStatus.BAD_REQUEST,
            out.handleIpn(signed("out-1", 1, 1000, now(), SECRET)).getStatusCode());
        verifyNoInteractions(wallet);

        IpnRequest ok = signed("out-1", 20000, 1000, now(), SECRET);
        assertEquals(HttpStatus.NO_CONTENT, out.handleIpn(ok).getStatusCode());
        out.handleIpn(ok); // replay
        assertEquals(TopupStatus.FAILED, req.getStatus());
        verify(wallet, times(1)).credit(eq(user), any(), eq("REFUND"), anyString());
    }

    private <T> void runConcurrently(int n, java.util.function.Supplier<T> call) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CyclicBarrier barrier = new CyclicBarrier(n);
        List<Future<T>> fs = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            fs.add(pool.submit(() -> { barrier.await(); return call.get(); }));
        }
        for (Future<T> f : fs) f.get(10, TimeUnit.SECONDS);
        pool.shutdown();
    }

    @Test
    void concurrentValidIpns_publishExactlyOnce() throws Exception {
        IpnRequest ipn = signed("ord-1", 50000, 0, now(), SECRET);
        runConcurrently(10, () -> topup.handleIpn(ipn));
        assertEquals(TopupStatus.CONFIRMED, pending.getStatus());
        verify(outboxRepo, times(1)).save(any(OutboxEvent.class));
    }

    @Test
    void concurrentValidFailedIpns_bankTransferOutRefundsExactlyOnce() throws Exception {
        BankTransferOutRequest req = new BankTransferOutRequest("out-1", user, "VCB", "123", new BigDecimal("10000"));
        when(outRepo.findByOrderId("out-1")).thenReturn(Optional.of(req));
        when(outRepo.transitionFromPending(eq("out-1"), any())).thenAnswer(inv -> {
            synchronized (req) {
                if (req.getStatus() != TopupStatus.PENDING) return 0;
                req.markStatus(inv.getArgument(1));
                return 1;
            }
        });
        IpnRequest ipn = signed("out-1", 10000, 1000, now(), SECRET);
        runConcurrently(10, () -> out.handleIpn(ipn));
        verify(wallet, times(1)).credit(eq(user), any(), eq("REFUND"), anyString());
    }
}
