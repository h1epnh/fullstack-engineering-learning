package com.ewalletlab.paymentrequestservice.service;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestStatus;
import com.ewalletlab.paymentrequestservice.repository.PaymentRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentRequestServiceTests {

    @Mock
    private PaymentRequestRepository repository;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private TransferServiceClient transferServiceClient;

    @Mock
    private WalletServiceClient walletServiceClient;

    private PaymentRequestMutationExecutor mutationExecutor;
    private PaymentRequestService service;

    private final UUID creatorUserId = UUID.randomUUID();
    private final UUID payerUserId = UUID.randomUUID();
    private PaymentRequest link;

    @BeforeEach
    void setUp() {
        mutationExecutor = new PaymentRequestMutationExecutor(repository);
        service = new PaymentRequestService(repository, userServiceClient, transferServiceClient, mutationExecutor, walletServiceClient, 24, 60);

        link = PaymentRequest.newLink(
            creatorUserId, "0901234567", "Nguyen Van A",
            new BigDecimal("100000"), "Tien an trua", Instant.now().plusSeconds(3600)
        );
        lenient().when(repository.findById(any())).thenReturn(Optional.of(link));
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void payLink_successfulFlow_transitionsPendingToPayingToPaidAndPassesIdempotencyKey() {
        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenReturn(new TransferServiceClient.TransferResult(payerUserId, creatorUserId, "Nguyen Van A", new BigDecimal("500000")));

        PaymentRequest paid = service.payLink(UUID.randomUUID(), payerUserId, false);

        assertEquals(PaymentRequestStatus.PAID, paid.getStatus());
        assertEquals(payerUserId, paid.getPaidByUserId());
        assertNotNull(paid.getPaidAt());
        assertEquals("500000", paid.getTransferReference());

        // Issue #126: verify transferServiceClient was called with idempotencyKey = "pay-req:" + id
        verify(transferServiceClient).transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), argThat(key -> key.startsWith("pay-req:")));
    }

    @Test
    void payLink_insufficientBalance_revertsToPending() {
        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenThrow(HttpClientErrorException.create(HttpStatus.CONFLICT, "Conflict", HttpHeaders.EMPTY, new byte[0], StandardCharsets.UTF_8));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Số dư không đủ"));
        assertEquals(PaymentRequestStatus.PENDING, link.getStatus());
        assertNull(link.getPaidByUserId());
    }

    @Test
    void payLink_stepUpRequired428_revertsToPending() {
        HttpClientErrorException stepUpEx = HttpClientErrorException.create(
            HttpStatusCode.valueOf(428), "Precondition Required", HttpHeaders.EMPTY,
            "Cần xác thực bổ sung theo QĐ 2345".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);

        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenThrow(stepUpEx);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(428, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("Cần xác thực bổ sung"));
        assertEquals(PaymentRequestStatus.PENDING, link.getStatus());
        assertNull(link.getPaidByUserId());
    }

    @Test
    void payLink_downstream503FailClosed_revertsToPending() {
        // Issue #85 / Issue #126: Downstream 503 Fail-Closed (eKYC unverifiable) rejected before debit.
        // Must release claim back to PENDING so user can retry!
        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenThrow(new HttpServerErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Hệ thống xác minh tạm thời gián đoạn"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        // Must be safely released to PENDING!
        assertEquals(PaymentRequestStatus.PENDING, link.getStatus());
        assertNull(link.getPaidByUserId());
    }

    @Test
    void payLink_downstream500_staysPaying() {
        // Ambiguous 500 error: stays PAYING to protect against double-spending until reconciler runs
        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertEquals(PaymentRequestStatus.PAYING, link.getStatus());
        assertEquals(payerUserId, link.getPaidByUserId());
    }

    @Test
    void payLink_networkTimeout_staysPaying() {
        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenThrow(new ResourceAccessException("Read timed out"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertEquals(PaymentRequestStatus.PAYING, link.getStatus());
        assertEquals(payerUserId, link.getPaidByUserId());
    }

    @Test
    void payLink_whenAlreadyPayingNotExpired_throws409Conflict() {
        link.markPaying(payerUserId);
        link.setPayingStartedAt(Instant.now()); // freshly started < 60s

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("đang được xử lý thanh toán"));
        verifyNoInteractions(transferServiceClient);
    }

    @Test
    void payLink_whenAlreadyPayingExpiredAndNotInWallet_revertsToPendingAndAllowsPayment() {
        link.markPaying(payerUserId);
        link.setPayingStartedAt(Instant.now().minusSeconds(120)); // expired > 60s

        // Reconciler checks wallet-service: no debit was made
        when(walletServiceClient.findTransactionByIdempotencyKey(eq(payerUserId), anyString()))
            .thenReturn(Optional.empty());

        when(transferServiceClient.transfer(eq(payerUserId), eq("0901234567"), eq(new BigDecimal("100000")), eq(false), anyString()))
            .thenReturn(new TransferServiceClient.TransferResult(payerUserId, creatorUserId, "Nguyen Van A", new BigDecimal("500000")));

        // Calling payLink triggers lazy reconciliation -> reverts to PENDING -> succeeds!
        PaymentRequest paid = service.payLink(UUID.randomUUID(), payerUserId, false);

        assertEquals(PaymentRequestStatus.PAID, paid.getStatus());
        assertEquals(payerUserId, paid.getPaidByUserId());
    }

    @Test
    void reconcile_whenDebitFoundInWallet_advancesToPaid() {
        link.markPaying(payerUserId);
        link.setPayingStartedAt(Instant.now().minusSeconds(120));

        UUID txnId = UUID.randomUUID();
        when(walletServiceClient.findTransactionByIdempotencyKey(eq(payerUserId), anyString()))
            .thenReturn(Optional.of(new WalletServiceClient.TransactionDto(
                txnId, UUID.randomUUID(), "TRANSFER_OUT", new BigDecimal("100000"), creatorUserId.toString(), "Payment", "pay-req:" + link.getId(), Instant.now()
            )));

        PaymentRequest reconciled = service.reconcile(link);

        assertEquals(PaymentRequestStatus.PAID, reconciled.getStatus());
        assertTrue(reconciled.getTransferReference().contains(txnId.toString()));
    }

    @Test
    void payLink_whenAlreadyPaid_throws409Conflict() {
        link.markPaid("ref-123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), payerUserId, false));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("đã được thanh toán rồi"));
        verifyNoInteractions(transferServiceClient);
    }

    @Test
    void payLink_selfPayment_rejectedWithBadRequest() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.payLink(UUID.randomUUID(), creatorUserId, false));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("Không thể tự thanh toán"));
        verifyNoInteractions(transferServiceClient);
    }
}
