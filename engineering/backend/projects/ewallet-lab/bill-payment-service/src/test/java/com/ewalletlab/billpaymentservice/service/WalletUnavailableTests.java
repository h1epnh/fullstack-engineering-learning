package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.repository.AutoBillRegistrationRepository;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.repository.DigitalSubscriptionRepository;
import com.ewalletlab.billpaymentservice.repository.InsurancePolicyRepository;
import com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.BuyPolicyRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.SubscribeDigitalServiceRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Issue #85 — wallet 503 (debit rejected BEFORE execution) => retryable 503, no credit/refund, voucher released; 409 eKYC passes through. */
class WalletUnavailableTests {

    private static final String MSG = "Không thể xác minh định danh lúc này, vui lòng thử lại sau";
    private final UUID user = UUID.randomUUID();
    private WalletServiceClient wallet;
    private LoyaltyServiceClient loyalty;
    private BillPaymentRepository billRepo;
    private BillPaymentService billService;

    private static HttpServerErrorException e503() {
        return HttpServerErrorException.create(HttpStatus.SERVICE_UNAVAILABLE, "Service Unavailable", new HttpHeaders(),
            MSG.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }

    @BeforeEach
    void setUp() {
        wallet = mock(WalletServiceClient.class);
        loyalty = mock(LoyaltyServiceClient.class);
        billRepo = mock(BillPaymentRepository.class);
        billService = new BillPaymentService(billRepo, mock(AutoBillRegistrationRepository.class), wallet, loyalty,
            mock(BnplServiceClient.class));
    }

    private void assertNoRefund(ResponseStatusException ex) {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, ex.getStatusCode());
        assertTrue(ex.getReason().contains("thử lại sau"));
        verify(wallet, never()).credit(any(), any(), any(), any(), any());
    }

    @Test
    void billPayment503_releasesVoucherButNeverRefundsMoney() {
        UUID voucher = UUID.randomUUID();
        when(loyalty.claimVoucher(any(), any(), anyString(), any(), any()))
            .thenReturn(new LoyaltyServiceClient.ClaimResult(voucher, "C", "T", new BigDecimal("1000")));
        when(wallet.debit(any(), any(), anyString(), anyString(), anyBoolean())).thenThrow(e503());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            billService.pay(new BillPayRequestDto(user, BillCategory.ELECTRICITY, "PE01001234", false, voucher)));

        assertNoRefund(ex);
        verify(loyalty).revertVoucher(voucher, user); // voucher is not money: still released
        verify(billRepo, never()).save(any());          // no receipt recorded
    }

    @Test
    void billPayment409Ekyc_messagePassesThrough_insufficientStillFriendly() {
        when(wallet.debit(any(), any(), anyString(), anyString(), anyBoolean())).thenThrow(
            HttpClientErrorException.create(HttpStatus.CONFLICT, "Conflict", new HttpHeaders(),
                "Ví chưa hoàn tất định danh (eKYC), vui lòng xác thực CCCD trước khi rút/chuyển tiền.".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8));
        ResponseStatusException ekyc = assertThrows(ResponseStatusException.class, () ->
            billService.pay(new BillPayRequestDto(user, BillCategory.ELECTRICITY, "PE01001234", false, null)));
        assertTrue(ekyc.getReason().contains("eKYC"));

        doThrow(HttpClientErrorException.create(HttpStatus.CONFLICT, "Conflict", new HttpHeaders(),
                "Insufficient balance".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8))
            .when(wallet).debit(any(), any(), anyString(), anyString(), anyBoolean());
        ResponseStatusException funds = assertThrows(ResponseStatusException.class, () ->
            billService.pay(new BillPayRequestDto(user, BillCategory.ELECTRICITY, "PE01001234", false, null)));
        assertEquals("Số dư không đủ để thanh toán hoá đơn", funds.getReason());
    }

    @Test
    void insurance503_createsNoPolicy() {
        InsurancePolicyRepository repo = mock(InsurancePolicyRepository.class);
        when(wallet.debit(any(), any(), anyString(), anyString(), anyBoolean())).thenThrow(e503());
        InsuranceService service = new InsuranceService(repo, wallet);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            service.buyPolicy(new BuyPolicyRequestDto(user, "MOTORCYCLE_TNDS", "Nguyen A", "012345678901", "59A1-12345")));

        assertNoRefund(ex);
        verify(repo, never()).save(any());
    }

    @Test
    void digitalSubscription503_createsNoOrder() {
        DigitalSubscriptionRepository subRepo = mock(DigitalSubscriptionRepository.class);
        when(wallet.debit(any(), any(), anyString(), anyBoolean())).thenThrow(e503());
        DigitalSubscriptionService service = new DigitalSubscriptionService(subRepo, billRepo, wallet);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
            service.subscribe(new SubscribeDigitalServiceRequestDto(user, "SPOTIFY_PREMIUM_1M", "a@b.vn", false)));

        assertNoRefund(ex);
        verify(subRepo, never()).save(any());
        verify(billRepo, never()).save(any());
    }
}
