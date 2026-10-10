package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletMutationExecutorTests {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private StepUpPolicy stepUpPolicy;

    @Mock
    private FamilyWalletServiceClient familyWalletServiceClient;

    @Mock
    private UserServiceClient userServiceClient;

    private WalletMutationExecutor executor;

    @BeforeEach
    void setUp() {
        executor = new WalletMutationExecutor(
            walletRepository,
            transactionRepository,
            new BigDecimal("100000000"), // monthlyOutboundLimit
            new BigDecimal("5000000"),   // unverifiedMonthlyLimit
            stepUpPolicy,
            familyWalletServiceClient,
            userServiceClient
        );
    }

    @Test
    @DisplayName("Tài khoản UNVERIFIED bị chặn khi chi tiêu vượt 5.000.000đ/tháng")
    void testUnverifiedUserExceedsLimit() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("10000000")); // Số dư 10tr đủ
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByWalletIdAndTypeInSince(any(), anySet(), any()))
            .thenReturn(new BigDecimal("4000000")); // Đã chi 4tr trong tháng

        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "UNVERIFIED", null))
        );

        // Chuyển thêm 2tr -> tổng 6tr > 5tr -> Bị chặn
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
            executor.debitOnce(userId, new BigDecimal("2000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key1")
        );

        assertTrue(ex.getMessage().contains("chưa định danh eKYC"));
        assertTrue(ex.getMessage().contains("5.000.000đ/tháng"));
    }

    @Test
    @DisplayName("Tài khoản VERIFIED chi tiêu được đến 100.000.000đ/tháng")
    void testVerifiedUserAllowedUpTo100M() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("50000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByWalletIdAndTypeInSince(any(), anySet(), any()))
            .thenReturn(new BigDecimal("4000000")); // Đã chi 4tr

        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "VERIFIED", "001200001234"))
        );
        when(familyWalletServiceClient.findLimit(userId)).thenReturn(Optional.empty());
        when(stepUpPolicy.requiresStepUp(any(), any())).thenReturn(false);

        // Chuyển 10tr -> tổng 14tr <= 100tr -> Thành công
        Wallet result = executor.debitOnce(userId, new BigDecimal("10000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key2");
        assertNotNull(result);
        verify(walletRepository).save(wallet);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("User cũ hoặc khi user-service không khả dụng: fail-open mặc định cho phép như VERIFIED")
    void testFailOpenDefaultsToVerified() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("20000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByWalletIdAndTypeInSince(any(), anySet(), any()))
            .thenReturn(new BigDecimal("4000000"));

        // user-service trả về empty (fail-open)
        when(userServiceClient.findUser(userId)).thenReturn(Optional.empty());
        when(familyWalletServiceClient.findLimit(userId)).thenReturn(Optional.empty());
        when(stepUpPolicy.requiresStepUp(any(), any())).thenReturn(false);

        // Chuyển 6tr -> tổng 10tr > 5tr nhưng vì fail-open nên áp hạn mức 100tr -> Thành công
        Wallet result = executor.debitOnce(userId, new BigDecimal("6000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key3");
        assertNotNull(result);
        verify(walletRepository).save(wallet);
    }
}
