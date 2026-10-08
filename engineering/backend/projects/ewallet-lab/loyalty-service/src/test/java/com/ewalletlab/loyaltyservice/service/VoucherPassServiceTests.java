package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.domain.*;
import com.ewalletlab.loyaltyservice.repository.VoucherPassPurchaseRepository;
import com.ewalletlab.loyaltyservice.repository.VoucherRepository;
import com.ewalletlab.loyaltyservice.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class VoucherPassServiceTests {

    private VoucherPassPurchaseRepository passPurchaseRepository;
    private VoucherRepository voucherRepository;
    private VoucherMutationExecutor mutationExecutor;
    private WalletServiceClient walletServiceClient;
    private VoucherPassService voucherPassService;

    @BeforeEach
    void setUp() {
        passPurchaseRepository = Mockito.mock(VoucherPassPurchaseRepository.class);
        voucherRepository = Mockito.mock(VoucherRepository.class);
        mutationExecutor = new VoucherMutationExecutor(voucherRepository);
        walletServiceClient = Mockito.mock(WalletServiceClient.class);
        voucherPassService = new VoucherPassService(passPurchaseRepository, voucherRepository, mutationExecutor, walletServiceClient);
    }

    @Test
    void testPurchasePassSuccess() {
        UUID userId = UUID.randomUUID();
        var req = new PurchasePassRequestDto(userId, "PASS_BILL_SAVER");

        when(walletServiceClient.debitVoucherPass(eq(userId), eq(new BigDecimal("15000")), any(), eq("Gói Tiết Kiệm Hoá Đơn")))
            .thenReturn(new WalletServiceClient.WalletResult(userId, new BigDecimal("85000")));

        when(passPurchaseRepository.save(any(VoucherPassPurchase.class))).thenAnswer(inv -> inv.getArgument(0));
        when(voucherRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        VoucherPassPurchaseDto result = voucherPassService.purchasePass(req);
        assertNotNull(result);
        assertEquals("PASS_BILL_SAVER", result.passCode());
        assertEquals(3, result.vouchers().size());
        verify(walletServiceClient).debitVoucherPass(eq(userId), eq(new BigDecimal("15000")), any(), eq("Gói Tiết Kiệm Hoá Đơn"));
    }

    @Test
    void testPurchasePassInsufficientBalance() {
        UUID userId = UUID.randomUUID();
        var req = new PurchasePassRequestDto(userId, "PASS_BILL_SAVER");

        when(walletServiceClient.debitVoucherPass(eq(userId), any(), any(), any()))
            .thenThrow(new HttpClientErrorException(org.springframework.http.HttpStatus.CONFLICT));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> voucherPassService.purchasePass(req));
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
        verify(passPurchaseRepository, never()).save(any());
    }

    @Test
    void testClaimVoucherSuccess() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        Voucher voucher = new Voucher(
            userId, UUID.randomUUID(), "VP-12345678", "Giảm 10.000đ", "Test",
            new BigDecimal("10000"), new BigDecimal("50000"), "ALL",
            Instant.now().plus(10, ChronoUnit.DAYS)
        );

        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(voucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> inv.getArgument(0));

        var req = new ClaimVoucherRequestDto(userId, "ELECTRICITY", new BigDecimal("60000"), UUID.randomUUID());
        ClaimVoucherResultDto claimResult = voucherPassService.claimVoucher(voucherId, req);

        assertNotNull(claimResult);
        assertEquals(new BigDecimal("10000"), claimResult.discountAmount());
        assertEquals(VoucherStatus.USED, voucher.getStatus());
        assertNotNull(voucher.getUsedAt());
    }

    @Test
    void testClaimVoucherAlreadyUsedThrowsConflict() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        Voucher voucher = new Voucher(
            userId, UUID.randomUUID(), "VP-12345678", "Giảm 10.000đ", "Test",
            new BigDecimal("10000"), new BigDecimal("50000"), "ALL",
            Instant.now().plus(10, ChronoUnit.DAYS)
        );
        voucher.setStatus(VoucherStatus.USED);

        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(voucher));

        var req = new ClaimVoucherRequestDto(userId, "ELECTRICITY", new BigDecimal("60000"), UUID.randomUUID());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> voucherPassService.claimVoucher(voucherId, req));
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void testClaimVoucherMinOrderNotMetThrowsBadRequest() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        Voucher voucher = new Voucher(
            userId, UUID.randomUUID(), "VP-12345678", "Giảm 10.000đ", "Test",
            new BigDecimal("10000"), new BigDecimal("50000"), "ALL",
            Instant.now().plus(10, ChronoUnit.DAYS)
        );

        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(voucher));

        // Bill chỉ có 30.000đ trong khi min order là 50.000đ
        var req = new ClaimVoucherRequestDto(userId, "ELECTRICITY", new BigDecimal("30000"), UUID.randomUUID());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> voucherPassService.claimVoucher(voucherId, req));
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void testRevertVoucher() {
        UUID userId = UUID.randomUUID();
        UUID voucherId = UUID.randomUUID();
        Voucher voucher = new Voucher(
            userId, UUID.randomUUID(), "VP-12345678", "Giảm 10.000đ", "Test",
            new BigDecimal("10000"), new BigDecimal("50000"), "ALL",
            Instant.now().plus(10, ChronoUnit.DAYS)
        );
        voucher.setStatus(VoucherStatus.USED);
        voucher.setUsedAt(Instant.now());

        when(voucherRepository.findById(voucherId)).thenReturn(Optional.of(voucher));
        when(voucherRepository.save(any(Voucher.class))).thenAnswer(inv -> inv.getArgument(0));

        voucherPassService.revertVoucher(voucherId, new RevertVoucherRequestDto(userId));
        assertEquals(VoucherStatus.AVAILABLE, voucher.getStatus());
        assertNull(voucher.getUsedAt());
    }
}

