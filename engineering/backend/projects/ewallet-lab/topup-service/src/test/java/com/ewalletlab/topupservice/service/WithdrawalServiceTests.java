package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.LinkedBankAccount;
import com.ewalletlab.topupservice.domain.MerchantWithdrawalTracker;
import com.ewalletlab.topupservice.domain.Withdrawal;
import com.ewalletlab.topupservice.repository.LinkedBankAccountRepository;
import com.ewalletlab.topupservice.repository.MerchantWithdrawalTrackerRepository;
import com.ewalletlab.topupservice.repository.WithdrawalRepository;
import com.ewalletlab.topupservice.web.dto.WithdrawalRequestDto;
import com.ewalletlab.topupservice.web.dto.WithdrawalResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WithdrawalServiceTests {

    @Mock
    private LinkedBankAccountRepository linkedBankAccountRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private WithdrawalRepository withdrawalRepository;

    @Mock
    private MerchantWithdrawalTrackerRepository trackerRepository;

    private WithdrawalService withdrawalService;

    private final UUID userId = UUID.randomUUID();
    private final String currentYearMonth = YearMonth.now(WithdrawalService.VN_ZONE).toString();

    @BeforeEach
    void setUp() {
        withdrawalService = new WithdrawalService(
            linkedBankAccountRepository,
            walletServiceClient,
            userServiceClient,
            withdrawalRepository,
            trackerRepository
        );
    }

    @Test
    @DisplayName("Người dùng cá nhân thông thường rút tiền không bị tính phí")
    void testNonMerchantWithdrawalFree() {
        when(linkedBankAccountRepository.findByUserId(userId))
            .thenReturn(List.of(new LinkedBankAccount(userId, "VCB", "1234567890")));
        when(userServiceClient.getMerchantByUserId(userId)).thenReturn(Optional.empty());
        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("5000000")), eq("WITHDRAW"), anyString(), anyBoolean()))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("10000000")));

        WithdrawalRequestDto request = new WithdrawalRequestDto(userId, new BigDecimal("5000000"), false);
        WithdrawalResponseDto response = withdrawalService.processWithdrawal(request);

        assertEquals(BigDecimal.ZERO, response.fee());
        assertEquals(new BigDecimal("10000000"), response.balance());
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), anyBoolean());
        verify(withdrawalRepository).save(any(Withdrawal.class));
    }

    @Test
    @DisplayName("Merchant rút tiền trong hạn mức 30tr/tháng được miễn phí hoàn toàn")
    void testMerchantWithdrawalUnderThresholdFree() {
        when(linkedBankAccountRepository.findByUserId(userId))
            .thenReturn(List.of(new LinkedBankAccount(userId, "VCB", "1234567890")));
        when(userServiceClient.getMerchantByUserId(userId))
            .thenReturn(Optional.of(new UserServiceClient.MerchantDto(UUID.randomUUID(), userId, "Shop A", "Retail", "qr")));

        MerchantWithdrawalTracker tracker = new MerchantWithdrawalTracker(userId, currentYearMonth, BigDecimal.ZERO);

        when(trackerRepository.findWithLockByUserIdAndYearMonth(userId, currentYearMonth))
            .thenReturn(Optional.of(tracker));

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("20000000")), eq("WITHDRAW"), anyString(), anyBoolean()))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("30000000")));

        WithdrawalRequestDto request = new WithdrawalRequestDto(userId, new BigDecimal("20000000"), false);
        WithdrawalResponseDto response = withdrawalService.processWithdrawal(request);

        assertEquals(BigDecimal.ZERO, response.fee());
        assertEquals(new BigDecimal("30000000"), response.balance());
        assertEquals(new BigDecimal("20000000"), tracker.getCumulativeWithdrawn());
        // Only 1 debit for withdrawal amount
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("Merchant rút tiền chạm ngưỡng và vượt 30tr: tính phí 0.5% trên phần vượt")
    void testMerchantWithdrawalCrossingThresholdChargesFeeOnExcessOnly() {
        when(linkedBankAccountRepository.findByUserId(userId))
            .thenReturn(List.of(new LinkedBankAccount(userId, "VCB", "1234567890")));
        when(userServiceClient.getMerchantByUserId(userId))
            .thenReturn(Optional.of(new UserServiceClient.MerchantDto(UUID.randomUUID(), userId, "Shop A", "Retail", "qr")));

        // Previously withdrawn 20.000.000đ this month. Now withdrawing another 20.000.000đ.
        // Total = 40.000.000đ (> 30.000.000đ). Excess = 10.000.000đ. Fee = 10.000.000 * 0.005 = 50.000đ.
        MerchantWithdrawalTracker tracker = new MerchantWithdrawalTracker(userId, currentYearMonth, new BigDecimal("20000000"));

        when(trackerRepository.findWithLockByUserIdAndYearMonth(userId, currentYearMonth))
            .thenReturn(Optional.of(tracker));

        when(walletServiceClient.getBalance(userId)).thenReturn(new BigDecimal("25000000"));

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("20000000")), eq("WITHDRAW"), eq("Rút tiền qua topup-service"), anyBoolean()))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("5000000")));
        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("50000")), eq("WITHDRAW"), anyString(), eq(true)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("4950000")));

        WithdrawalRequestDto request = new WithdrawalRequestDto(userId, new BigDecimal("20000000"), false);
        WithdrawalResponseDto response = withdrawalService.processWithdrawal(request);

        assertEquals(new BigDecimal("50000"), response.fee());
        assertEquals(new BigDecimal("4950000"), response.balance());
        assertEquals(new BigDecimal("40000000"), tracker.getCumulativeWithdrawn());

        // 2 debits: 1 for withdrawal, 1 for fee
        verify(walletServiceClient, times(2)).debit(any(), any(), any(), any(), anyBoolean());
    }

    @Test
    @DisplayName("Merchant đã vượt ngưỡng 30tr: tính phí 0.5% trên toàn bộ số tiền rút lần này")
    void testMerchantWithdrawalAboveThresholdChargesFeeOnEntireAmount() {
        when(linkedBankAccountRepository.findByUserId(userId))
            .thenReturn(List.of(new LinkedBankAccount(userId, "VCB", "1234567890")));
        when(userServiceClient.getMerchantByUserId(userId))
            .thenReturn(Optional.of(new UserServiceClient.MerchantDto(UUID.randomUUID(), userId, "Shop A", "Retail", "qr")));

        // Previously withdrawn 35.000.000đ this month. Now withdrawing 10.000.000đ.
        // Fee = 10.000.000 * 0.005 = 50.000đ.
        MerchantWithdrawalTracker tracker = new MerchantWithdrawalTracker(userId, currentYearMonth, new BigDecimal("35000000"));

        when(trackerRepository.findWithLockByUserIdAndYearMonth(userId, currentYearMonth))
            .thenReturn(Optional.of(tracker));

        when(walletServiceClient.getBalance(userId)).thenReturn(new BigDecimal("15000000"));

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("10000000")), eq("WITHDRAW"), eq("Rút tiền qua topup-service"), anyBoolean()))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("5000000")));
        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("50000")), eq("WITHDRAW"), anyString(), eq(true)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("4950000")));

        WithdrawalRequestDto request = new WithdrawalRequestDto(userId, new BigDecimal("10000000"), false);
        WithdrawalResponseDto response = withdrawalService.processWithdrawal(request);

        assertEquals(new BigDecimal("50000"), response.fee());
        assertEquals(new BigDecimal("4950000"), response.balance());
        assertEquals(new BigDecimal("45000000"), tracker.getCumulativeWithdrawn());
    }
}
