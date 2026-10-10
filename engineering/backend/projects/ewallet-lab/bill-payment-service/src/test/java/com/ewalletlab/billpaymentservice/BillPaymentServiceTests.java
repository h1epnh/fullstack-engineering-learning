package com.ewalletlab.billpaymentservice;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.repository.AutoBillRegistrationRepository;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
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
    private BillPaymentService billPaymentService;

    @BeforeEach
    void setUp() {
        billPaymentRepository = Mockito.mock(BillPaymentRepository.class);
        autoBillRegistrationRepository = Mockito.mock(AutoBillRegistrationRepository.class);
        walletServiceClient = Mockito.mock(WalletServiceClient.class);
        loyaltyServiceClient = Mockito.mock(LoyaltyServiceClient.class);
        bnplServiceClient = Mockito.mock(BnplServiceClient.class);
        billPaymentService = new BillPaymentService(billPaymentRepository, autoBillRegistrationRepository, walletServiceClient, loyaltyServiceClient, bnplServiceClient);
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
}

