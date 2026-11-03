package com.ewalletlab.billpaymentservice;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.repository.AutoBillRegistrationRepository;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.repository.DigitalSubscriptionRepository;
import com.ewalletlab.billpaymentservice.service.BillPaymentService;
import com.ewalletlab.billpaymentservice.service.BnplServiceClient;
import com.ewalletlab.billpaymentservice.service.LoyaltyServiceClient;
import com.ewalletlab.billpaymentservice.service.WalletServiceClient;
import com.ewalletlab.billpaymentservice.web.dto.AutoPayRunSummaryDto;
import com.ewalletlab.billpaymentservice.web.dto.RegisterAutoBillRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BillPaymentServiceTests {

    private BillPaymentRepository billPaymentRepository;
    private AutoBillRegistrationRepository autoBillRegistrationRepository;
    private WalletServiceClient walletServiceClient;
    private LoyaltyServiceClient loyaltyServiceClient;
    private BnplServiceClient bnplServiceClient;
    private DigitalSubscriptionRepository digitalSubscriptionRepository;
    private BillPaymentService billPaymentService;

    @BeforeEach
    void setUp() {
        billPaymentRepository = Mockito.mock(BillPaymentRepository.class);
        when(billPaymentRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(billPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        autoBillRegistrationRepository = Mockito.mock(AutoBillRegistrationRepository.class);
        walletServiceClient = Mockito.mock(WalletServiceClient.class);
        loyaltyServiceClient = Mockito.mock(LoyaltyServiceClient.class);
        bnplServiceClient = Mockito.mock(BnplServiceClient.class);
        digitalSubscriptionRepository = Mockito.mock(DigitalSubscriptionRepository.class);
        billPaymentService = new BillPaymentService(billPaymentRepository, autoBillRegistrationRepository, walletServiceClient, loyaltyServiceClient, bnplServiceClient, digitalSubscriptionRepository);
    }

    @Test
    void testRegisterAutoBill() {
        UUID userId = UUID.randomUUID();
        RegisterAutoBillRequestDto req = new RegisterAutoBillRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("500000"), 15
        );

        when(autoBillRegistrationRepository.findByUserIdAndCategoryAndCustomerCodeAndStatus(
            eq(userId), eq(BillCategory.ELECTRICITY), eq("PE01001234"), eq(AutoBillStatus.ACTIVE)
        )).thenReturn(Optional.empty());

        when(autoBillRegistrationRepository.save(any(AutoBillRegistration.class))).thenAnswer(inv -> inv.getArgument(0));

        var result = billPaymentService.registerAutoBill(req);
        assertNotNull(result);
        assertEquals(userId, result.userId());
        assertEquals("PE01001234", result.customerCode());
        assertEquals(new BigDecimal("500000"), result.maxAmount());
        assertEquals(15, result.autoPayDay());
        assertEquals(AutoBillStatus.ACTIVE, result.status());
    }

    @Test
    void testAutoPaySkippedWhenAlreadyPaid() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("2000000"), 15
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(true);

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);
        assertEquals(1, summary.totalProcessed());
        assertEquals(0, summary.successCount());
        assertEquals(1, summary.skippedCount());
        assertEquals("SKIPPED_ALREADY_PAID", summary.details().get(0).status());

        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), any(Boolean.class));
    }

    @Test
    void testAutoPaySkippedWhenExceedsMaxAmount() {
        UUID userId = UUID.randomUUID();
        // mock amount will be between 50.000 and 2.000.000, set maxAmount to 10.000 so it will exceed
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("10000"), 15
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);
        assertEquals(1, summary.totalProcessed());
        assertEquals(0, summary.successCount());
        assertEquals(1, summary.skippedCount());
        assertEquals("SKIPPED_EXCEEDED_MAX_AMOUNT", summary.details().get(0).status());

        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), any(Boolean.class));
    }

    @Test
    void testAutoPaySuccess() {
        UUID userId = UUID.randomUUID();
        // set maxAmount high so it won't exceed
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        when(walletServiceClient.debit(eq(userId), any(), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("10000000")));

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);
        assertEquals(1, summary.totalProcessed());
        assertEquals(1, summary.successCount());
        assertEquals(0, summary.skippedCount());
        assertEquals(0, summary.failedCount());
        assertEquals("SUCCESS", summary.details().get(0).status());

        verify(walletServiceClient).debit(eq(userId), any(), anyString(), anyString(), eq(false));
        verify(billPaymentRepository).saveAndFlush(any());
    }

    @Test
    void testAutoPayConcurrencyConflictSkippedAlreadyPaid() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        when(billPaymentRepository.saveAndFlush(any()))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Duplicate key violation"));

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);
        assertEquals(1, summary.totalProcessed());
        assertEquals(0, summary.successCount());
        assertEquals(1, summary.skippedCount());
        assertEquals(0, summary.failedCount());
        assertEquals("SKIPPED_ALREADY_PAID", summary.details().get(0).status());

        verify(walletServiceClient, never()).debit(any(), any(), anyString(), anyString(), anyBoolean());
    }

    @Test
    void testAutoPayStepUp428Skipped() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        when(walletServiceClient.debit(eq(userId), any(), anyString(), anyString(), eq(false)))
            .thenThrow(new org.springframework.web.client.HttpClientErrorException(org.springframework.http.HttpStatus.PRECONDITION_REQUIRED));

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);
        assertEquals(1, summary.totalProcessed());
        assertEquals(0, summary.successCount());
        assertEquals(1, summary.skippedCount());
        assertEquals(0, summary.failedCount());
        assertEquals("SKIPPED_STEP_UP_REQUIRED", summary.details().get(0).status());

        verify(billPaymentRepository).delete(any());
    }

    @Test
    void testPayWithVoucherDiscount() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, voucherId
        );

        when(loyaltyServiceClient.claimVoucher(eq(voucherId), eq(userId), eq("ELECTRICITY"), any(), any()))
            .thenReturn(new LoyaltyServiceClient.ClaimResult(voucherId, "VP-TEST", "Giảm 10.000đ", new BigDecimal("10000")));

        when(walletServiceClient.debit(eq(userId), any(), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("500000")));

        when(billPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var receipt = billPaymentService.pay(req);
        assertNotNull(receipt);
        assertEquals(new BigDecimal("10000"), receipt.discountAmount());
        assertEquals(voucherId, receipt.voucherId());
        assertEquals(receipt.amount().subtract(new BigDecimal("10000")), receipt.finalAmount());

        verify(loyaltyServiceClient).claimVoucher(eq(voucherId), eq(userId), eq("ELECTRICITY"), any(), any());
        verify(loyaltyServiceClient, never()).revertVoucher(any(), any());
    }

    @Test
    void testPayWithVoucherDebitFailsRevertsVoucher() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, voucherId
        );

        when(loyaltyServiceClient.claimVoucher(eq(voucherId), eq(userId), eq("ELECTRICITY"), any(), any()))
            .thenReturn(new LoyaltyServiceClient.ClaimResult(voucherId, "VP-TEST", "Giảm 10.000đ", new BigDecimal("10000")));

        when(walletServiceClient.debit(eq(userId), any(), anyString(), anyString(), eq(false)))
            .thenThrow(new org.springframework.web.client.HttpClientErrorException(org.springframework.http.HttpStatus.CONFLICT));

        org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );

        verify(loyaltyServiceClient).revertVoucher(eq(voucherId), eq(userId));
    }

    @Test
    void testPayWithBnplWalletSuccess() {
        UUID userId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, null,
            com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET
        );

        when(bnplServiceClient.getWallet(eq(userId)))
            .thenReturn(new BnplServiceClient.BnplWalletDto(true, new BigDecimal("20000000"), new BigDecimal("15000000"), BigDecimal.ZERO, BigDecimal.ZERO));

        when(bnplServiceClient.draw(eq(userId), any(), anyString()))
            .thenReturn(new BnplServiceClient.BnplWalletDto(true, new BigDecimal("20000000"), new BigDecimal("14500000"), new BigDecimal("500000"), BigDecimal.ZERO));

        when(billPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var receipt = billPaymentService.pay(req);
        assertNotNull(receipt);
        assertEquals(com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET, receipt.paymentSource());
        assertEquals(new BigDecimal("14500000"), receipt.newBalance());
        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), anyBoolean());
        verify(bnplServiceClient).draw(eq(userId), any(), anyString());
    }

    @Test
    void testPayWithBnplWalletNotOpenedThrows400() {
        UUID userId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, null,
            com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET
        );

        when(bnplServiceClient.getWallet(eq(userId)))
            .thenReturn(new BnplServiceClient.BnplWalletDto(false, null, null, null, null));

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(bnplServiceClient, never()).draw(any(), any(), anyString());
    }

    @Test
    void testPayWithBnplWalletInsufficientLimitThrows409() {
        UUID userId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, null,
            com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET
        );

        when(bnplServiceClient.getWallet(eq(userId)))
            .thenReturn(new BnplServiceClient.BnplWalletDto(true, new BigDecimal("20000000"), new BigDecimal("1000"), BigDecimal.ZERO, BigDecimal.ZERO));

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(bnplServiceClient, never()).draw(any(), any(), anyString());
    }

    @Test
    void testPayWithBnplWalletCompensationOnSaveFailure() {
        UUID userId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, null,
            com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET
        );

        when(bnplServiceClient.getWallet(eq(userId)))
            .thenReturn(new BnplServiceClient.BnplWalletDto(true, new BigDecimal("20000000"), new BigDecimal("15000000"), BigDecimal.ZERO, BigDecimal.ZERO));

        when(bnplServiceClient.draw(eq(userId), any(), anyString()))
            .thenReturn(new BnplServiceClient.BnplWalletDto(true, new BigDecimal("20000000"), new BigDecimal("14500000"), new BigDecimal("500000"), BigDecimal.ZERO));

        when(billPaymentRepository.save(any())).thenThrow(new RuntimeException("DB crash"));

        org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );

        // Verify compensation refund called!
        verify(bnplServiceClient).refund(eq(userId), any(), anyString());
    }

    @Test
    void testLookupAlreadyPaidThrows409() {
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(eq(BillCategory.ELECTRICITY), eq("PE01001234"), anyString()))
            .thenReturn(true);

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.lookup(BillCategory.ELECTRICITY, "PE01001234")
        );
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        org.junit.jupiter.api.Assertions.assertTrue(ex.getReason().contains("đã được thanh toán"));
    }

    @Test
    void testPayAlreadyPaidThrows409WithoutCallingWalletOrVoucher() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, voucherId
        );

        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(eq(BillCategory.ELECTRICITY), eq("PE01001234"), anyString()))
            .thenReturn(true);

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        org.junit.jupiter.api.Assertions.assertTrue(ex.getReason().contains("đã được thanh toán"));

        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), anyBoolean());
        verify(loyaltyServiceClient, never()).claimVoucher(any(), any(), any(), any(), any());
        verify(bnplServiceClient, never()).draw(any(), any(), any());
    }

    @Test
    void testPayClaimFirstPreventsQuotaLeakageOnRaceCondition() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, voucherId
        );

        // exists ban đầu là false (2 luồng cùng pass qua check ban đầu)
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(eq(BillCategory.ELECTRICITY), eq("PE01001234"), anyString()))
            .thenReturn(false);

        // Luồng thua đụng unique constraint ngay tại bước Claim-First saveAndFlush()
        when(billPaymentRepository.saveAndFlush(any()))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("uq_bill_payments_category_customer_period"));

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        org.junit.jupiter.api.Assertions.assertTrue(ex.getReason().contains("đang được xử lý hoặc đã được thanh toán"));

        // Xác minh cốt lõi Issue #125: Luồng thua KHÔNG ĐƯỢC PHÉP gọi debit ví (chống lẹm hạn mức 100M/tháng và 20M/ngày)
        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), anyBoolean());
        // Xác minh KHÔNG phát sinh giao dịch REFUND bù trừ rác
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any());
        // Xác minh KHÔNG lãng phí voucher
        verify(loyaltyServiceClient, never()).claimVoucher(any(), any(), any(), any(), any());
    }

    @Test
    void testPayBnplClaimFirstPreventsBnplDrawOnRaceCondition() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, voucherId,
            com.ewalletlab.billpaymentservice.domain.PaymentSource.BNPL_WALLET
        );

        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(eq(BillCategory.ELECTRICITY), eq("PE01001234"), anyString()))
            .thenReturn(false);

        when(billPaymentRepository.saveAndFlush(any()))
            .thenThrow(new org.springframework.dao.DataIntegrityViolationException("uq_bill_payments_category_customer_period"));

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.pay(req)
        );
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        org.junit.jupiter.api.Assertions.assertTrue(ex.getReason().contains("đang được xử lý hoặc đã được thanh toán"));

        // Xác minh không gọi draw BNPL và không gọi refund
        verify(bnplServiceClient, never()).draw(any(), any(), any());
        verify(bnplServiceClient, never()).refund(any(), any(), any());
        verify(loyaltyServiceClient, never()).claimVoucher(any(), any(), any(), any(), any());
    }

    @Test
    void testConcurrentPayRequestsOnlyOneWinsDebit() throws Exception {
        UUID userId = UUID.randomUUID();
        var req = new com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto(
            userId, BillCategory.ELECTRICITY, "PE01001234", false, null
        );

        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(eq(BillCategory.ELECTRICITY), eq("PE01001234"), anyString()))
            .thenReturn(false);

        // Mô phỏng DB lock: Request đầu tiên saveAndFlush thành công, request thứ hai văng DataIntegrityViolationException
        java.util.concurrent.atomic.AtomicInteger attempts = new java.util.concurrent.atomic.AtomicInteger(0);
        when(billPaymentRepository.saveAndFlush(any())).thenAnswer(inv -> {
            if (attempts.incrementAndGet() == 1) {
                return inv.getArgument(0);
            } else {
                throw new org.springframework.dao.DataIntegrityViolationException("uq_bill_payments_category_customer_period");
            }
        });

        when(walletServiceClient.debit(eq(userId), any(), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("10000000")));

        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(2);
        java.util.concurrent.CountDownLatch startLatch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.atomic.AtomicInteger successCount = new java.util.concurrent.atomic.AtomicInteger(0);
        java.util.concurrent.atomic.AtomicInteger conflictCount = new java.util.concurrent.atomic.AtomicInteger(0);

        java.util.concurrent.Callable<Void> task = () -> {
            startLatch.await();
            try {
                billPaymentService.pay(req);
                successCount.incrementAndGet();
            } catch (org.springframework.web.server.ResponseStatusException e) {
                if (e.getStatusCode() == org.springframework.http.HttpStatus.CONFLICT) {
                    conflictCount.incrementAndGet();
                }
            }
            return null;
        };

        java.util.concurrent.Future<Void> f1 = executor.submit(task);
        java.util.concurrent.Future<Void> f2 = executor.submit(task);

        startLatch.countDown();
        f1.get(5, java.util.concurrent.TimeUnit.SECONDS);
        f2.get(5, java.util.concurrent.TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(), "Chỉ đúng 1 luồng thanh toán thành công");
        assertEquals(1, conflictCount.get(), "Luồng còn lại nhận lỗi 409 Conflict");
        // Verify ví chỉ bị debit đúng 1 lần duy nhất, không bị debit 2 lần rồi hoàn tiền
        verify(walletServiceClient, org.mockito.Mockito.times(1)).debit(eq(userId), any(), anyString(), anyString(), eq(false));
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any());
    }

    // --- Issue #89: Upcoming Bills Radar & Bill Spike Protection Tests ---

    @Test
    void testAutoPaySpikeDetectedWhenAmountIncreasesOver30Percent() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15, 30.0
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        // Giả lập kỳ trước có hoá đơn 100.000đ, trong khi mockDueAmount của PE01001234 chắc chắn > 130.000đ
        com.ewalletlab.billpaymentservice.domain.BillPayment prevBill = new com.ewalletlab.billpaymentservice.domain.BillPayment(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("100000"), "09/2026"
        );
        when(billPaymentRepository.findByUserIdAndCategoryAndCustomerCodeOrderByCreatedAtDesc(eq(userId), eq(BillCategory.ELECTRICITY), eq("PE01001234")))
            .thenReturn(List.of(prevBill));

        when(autoBillRegistrationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);

        assertEquals(1, summary.totalProcessed());
        assertEquals(0, summary.successCount());
        assertEquals(1, summary.skippedCount());
        assertEquals("HELD_FOR_SPIKE_REVIEW", summary.details().get(0).status());
        assertEquals(AutoBillStatus.HELD_FOR_SPIKE_REVIEW, reg.getStatus());
        assertNotNull(reg.getHeldAmount());
        assertNotNull(reg.getHeldReason());

        // KHÔNG ĐƯỢC trừ tiền ví khi phát hiện Spike!
        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void testAutoPayNormalWhenAmountIncreaseUnder30Percent() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15, 30.0
        );

        when(autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(any(), any(), any())).thenReturn(false);

        // Giả lập kỳ trước có hoá đơn rất lớn (20.000.000đ), nên kỳ này mock amount (~1.000.000) là giảm chứ không spike
        com.ewalletlab.billpaymentservice.domain.BillPayment prevBill = new com.ewalletlab.billpaymentservice.domain.BillPayment(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("20000000"), "09/2026"
        );
        when(billPaymentRepository.findByUserIdAndCategoryAndCustomerCodeOrderByCreatedAtDesc(eq(userId), eq(BillCategory.ELECTRICITY), eq("PE01001234")))
            .thenReturn(List.of(prevBill));

        when(billPaymentRepository.saveAndFlush(any())).thenAnswer(inv -> inv.getArgument(0));
        when(walletServiceClient.debit(eq(userId), any(), any(), any(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));

        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(true);

        assertEquals(1, summary.totalProcessed());
        assertEquals(1, summary.successCount());
        assertEquals(0, summary.skippedCount());
        assertEquals("SUCCESS", summary.details().get(0).status());
        verify(walletServiceClient).debit(eq(userId), any(), any(), any(), eq(false));
    }

    @Test
    void testApproveSpikeSuccess() {
        UUID regId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );
        reg.setStatus(AutoBillStatus.HELD_FOR_SPIKE_REVIEW);
        reg.setHeldAmount(new BigDecimal("1500000"));
        reg.setHeldPeriod("10/2026");
        reg.setHeldReason("Tăng 50%");

        when(autoBillRegistrationRepository.findById(eq(regId))).thenReturn(Optional.of(reg));
        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("1500000")), any(), any(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("500000")));
        when(billPaymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(autoBillRegistrationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var receipt = billPaymentService.approveSpike(regId);

        assertNotNull(receipt);
        assertEquals(userId, receipt.userId());
        assertEquals(new BigDecimal("1500000"), receipt.amount());
        assertEquals(AutoBillStatus.ACTIVE, reg.getStatus());
        org.junit.jupiter.api.Assertions.assertNull(reg.getHeldAmount());
        verify(walletServiceClient).debit(eq(userId), eq(new BigDecimal("1500000")), any(), any(), eq(false));
    }

    @Test
    void testApproveSpikeThrowsBadRequestWhenNotHeld() {
        UUID regId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );
        reg.setStatus(AutoBillStatus.ACTIVE);

        when(autoBillRegistrationRepository.findById(eq(regId))).thenReturn(Optional.of(reg));

        var ex = org.junit.jupiter.api.Assertions.assertThrows(
            org.springframework.web.server.ResponseStatusException.class,
            () -> billPaymentService.approveSpike(regId)
        );
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void testSkipCycleResetsStatusToActive() {
        UUID regId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), 15
        );
        reg.setStatus(AutoBillStatus.HELD_FOR_SPIKE_REVIEW);
        reg.setHeldAmount(new BigDecimal("1500000"));

        when(autoBillRegistrationRepository.findById(eq(regId))).thenReturn(Optional.of(reg));
        when(autoBillRegistrationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = billPaymentService.skipCycle(regId);

        assertEquals(AutoBillStatus.ACTIVE, result.status());
        org.junit.jupiter.api.Assertions.assertNull(reg.getHeldAmount());
        verify(walletServiceClient, never()).debit(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void testGetUpcomingRadarWithShortfall() {
        UUID userId = UUID.randomUUID();
        AutoBillRegistration reg = new AutoBillRegistration(
            userId, BillCategory.ELECTRICITY, "PE01001234", new BigDecimal("5000000"), java.time.LocalDate.now().getDayOfMonth()
        );

        when(autoBillRegistrationRepository.findByUserIdOrderByCreatedAtDesc(eq(userId))).thenReturn(List.of(reg));
        when(billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(any(), any(), any())).thenReturn(false);
        when(digitalSubscriptionRepository.findByUserIdOrderByCreatedAtDesc(eq(userId))).thenReturn(List.of());

        // Giả lập số dư ví 0đ -> shortfall sẽ bằng đúng totalDueNext7Days
        when(walletServiceClient.getBalance(eq(userId)))
            .thenReturn(new WalletServiceClient.WalletBalanceResponse(userId, BigDecimal.ZERO));

        var radar = billPaymentService.getUpcomingRadar(userId, 30);

        assertNotNull(radar);
        org.junit.jupiter.api.Assertions.assertFalse(radar.items().isEmpty());
        org.junit.jupiter.api.Assertions.assertTrue(radar.totalDueNext7Days().compareTo(BigDecimal.ZERO) > 0);
        assertEquals(radar.totalDueNext7Days(), radar.shortfallNext7Days());
    }
}

