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

/**
 * Issue #40 — revised to the binary eKYC-tier model (operator-confirmed after agent-designer
 * verified directly against momo.vn): UNVERIFIED wallets cannot move money OUT at all, regardless
 * of amount or type, while VERIFIED wallets keep the exact pre-#40 monthly-outbound-limit behavior
 * from issue #7. The old "5.000.000đ/tháng reduced cap for UNVERIFIED" model (never had a real
 * public-source citation — see issue #40 comment history) is gone; there is no intermediate cap.
 */
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
            new BigDecimal("100000000"), // monthlyOutboundLimit (issue #7, unchanged)
            stepUpPolicy,
            familyWalletServiceClient,
            userServiceClient
        );
    }

    @Test
    @DisplayName("UNVERIFIED bị chặn hoàn toàn khi debit (TRANSFER_OUT), dù số tiền rất nhỏ")
    void testUnverifiedUserBlockedOnAnyDebitAmount() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("10000000")); // Số dư đủ, không phải vấn đề insufficient-balance
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "UNVERIFIED", null))
        );

        // Chỉ 10.000đ — số rất nhỏ — vẫn phải bị chặn vì UNVERIFIED, không phải vì hạn mức.
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
            executor.debitOnce(userId, new BigDecimal("10000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key1")
        );

        assertTrue(ex.getMessage().contains("chưa hoàn tất định danh (eKYC)"));
        // Không được đụng tới sum/hạn mức tháng — bị chặn ngay ở bước eKYC, trước khi tính spentThisMonth.
        verify(transactionRepository, never()).sumAmountByWalletIdAndTypeInSince(any(), anySet(), any());
        verify(walletRepository, never()).save(any());
    }

    @Test
    @DisplayName("UNVERIFIED bị chặn với mọi loại debit (OUT): WITHDRAW, BILL_PAYMENT, BNPL_REPAYMENT, INVESTMENT_BUY")
    void testUnverifiedUserBlockedOnEveryOutboundType() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("50000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "UNVERIFIED", null))
        );

        for (TransactionType outType : new TransactionType[]{
            TransactionType.WITHDRAW, TransactionType.BILL_PAYMENT, TransactionType.BNPL_REPAYMENT,
            TransactionType.INVESTMENT_BUY, TransactionType.SAVINGS_GOAL_DEPOSIT, TransactionType.VOUCHER_PASS_PURCHASE
        }) {
            assertThrows(IllegalStateException.class, () ->
                executor.debitOnce(userId, new BigDecimal("1000"), outType, "ref", "test", false, "key-" + outType));
        }
    }

    @Test
    @DisplayName("UNVERIFIED vẫn credit (TOPUP/TRANSFER_IN/LOYALTY_REDEMPTION/INVESTMENT_SELL) bình thường — không bị chặn")
    void testUnverifiedUserCreditStillWorks() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        // Mockito's mock otherwise returns null from save() — real JPA returns the managed entity.
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        // creditOnce không hề gọi userServiceClient — credit luôn chạy bình thường bất kể kycTier.
        WalletMutationExecutor.MutationResult result =
            executor.creditOnce(userId, new BigDecimal("10000000"), TransactionType.TOPUP, "ref", "test", "key2");

        assertNotNull(result);
        assertNotNull(result.transaction());
        verify(userServiceClient, never()).findUser(any());
        verify(walletRepository).save(wallet);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("VERIFIED debit được bình thường, chịu đúng hạn mức 100.000.000đ/tháng cũ (issue #7)")
    void testVerifiedUserAllowedUpTo100M() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("50000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByWalletIdAndTypeInSince(any(), anySet(), any()))
            .thenReturn(new BigDecimal("4000000")); // Đã chi 4tr trong tháng

        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "VERIFIED", "001200001234"))
        );
        when(familyWalletServiceClient.findLimit(userId)).thenReturn(Optional.empty());
        when(stepUpPolicy.requiresStepUp(any(), any())).thenReturn(false);
        // Mockito's mock otherwise returns null from save() — real JPA returns the managed entity.
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        // Chuyển 10tr -> tổng 14tr <= 100tr -> Thành công
        WalletMutationExecutor.MutationResult result =
            executor.debitOnce(userId, new BigDecimal("10000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key3");
        assertNotNull(result);
        assertNotNull(result.transaction());
        verify(walletRepository).save(wallet);
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    @DisplayName("VERIFIED debit vượt 100.000.000đ/tháng vẫn bị chặn 409 theo đúng hạn mức pháp luật cũ (issue #7)")
    void testVerifiedUserExceeds100MLimit() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("200000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        when(transactionRepository.sumAmountByWalletIdAndTypeInSince(any(), anySet(), any()))
            .thenReturn(new BigDecimal("95000000")); // Đã chi 95tr trong tháng

        when(userServiceClient.findUser(userId)).thenReturn(
            Optional.of(new UserServiceClient.UserResponse(userId, "0901234567", "User A", "VERIFIED", "001200001234"))
        );

        // Chuyển thêm 10tr -> tổng 105tr > 100tr -> Bị chặn đúng hạn mức pháp luật cũ, KHÔNG phải lỗi eKYC.
        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
            executor.debitOnce(userId, new BigDecimal("10000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key4")
        );

        assertTrue(ex.getMessage().contains("Điều 26 Thông tư 40/2024/TT-NHNN"));
        assertFalse(ex.getMessage().contains("eKYC"));
    }

    private Wallet outWallet(UUID userId) {
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("20000000"));
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());
        return wallet;
    }

    @Test
    @DisplayName("#55 fail-closed OUT: user-service lỗi/timeout -> KycUnavailableException, ví không đổi, không ghi Transaction")
    void testFailClosedOutWhenUserServiceUnavailable() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = outWallet(userId);
        when(userServiceClient.findUser(userId))
            .thenThrow(new KycUnavailableException("Không thể xác minh định danh lúc này, vui lòng thử lại sau", new RuntimeException("timeout")));

        assertThrows(KycUnavailableException.class, () ->
            executor.debitOnce(userId, new BigDecimal("6000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key5"));

        assertEquals(0, wallet.getBalance().compareTo(new BigDecimal("20000000")));
        verify(walletRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("#55 fail-closed OUT: user 404 (không có trong user-service) -> chặn, ví không đổi")
    void testFailClosedOutWhenUserNotFound() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = outWallet(userId);
        when(userServiceClient.findUser(userId)).thenReturn(Optional.empty());

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
            executor.debitOnce(userId, new BigDecimal("6000000"), TransactionType.TRANSFER_OUT, "ref", "test", false, "key6"));

        assertTrue(ex.getMessage().contains("hồ sơ định danh"));
        assertEquals(0, wallet.getBalance().compareTo(new BigDecimal("20000000")));
        verify(walletRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("#55 chiều IN: credit TOPUP vẫn chạy khi user-service chết, không gọi user-service")
    void testCreditUnaffectedWhenUserServiceDown() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        when(transactionRepository.findByIdempotencyKey(any())).thenReturn(Optional.empty());

        WalletMutationExecutor.MutationResult result =
            executor.creditOnce(userId, new BigDecimal("1000000"), TransactionType.TOPUP, "ref", "test", "key7");

        assertNotNull(result);
        verify(userServiceClient, never()).findUser(any());
    }

    @Test
    @DisplayName("#66 Idempotent credit: nếu idempotencyKey đã tồn tại, không cộng tiền lần hai và không lưu Transaction mới")
    void testCreditWithExistingIdempotencyKeyDoesNotDoubleCredit() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);
        wallet.credit(new BigDecimal("500000")); // Số dư ban đầu 500k
        ReflectionTestUtils.setField(wallet, "id", UUID.randomUUID());

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));
        // Giả lập transaction với idempotencyKey này đã tồn tại
        Transaction existingTx = new Transaction(wallet.getId(), TransactionType.TOPUP, new BigDecimal("100000"), "bank-tx-1", "Topup", "topup:bank-tx-1");
        when(transactionRepository.findByIdempotencyKey("topup:bank-tx-1")).thenReturn(Optional.of(existingTx));

        WalletMutationExecutor.MutationResult result =
            executor.creditOnce(userId, new BigDecimal("100000"), TransactionType.TOPUP, "bank-tx-1", "Topup", "topup:bank-tx-1");

        // Số dư ví vẫn giữ nguyên 500k, không bị cộng thêm thành 600k
        assertEquals(new BigDecimal("500000"), result.wallet().getBalance());
        // Idempotent short-circuit: không có Transaction MỚI nào được tạo trong lần gọi này — ADR-06
        // dựa vào null này để KHÔNG publish thêm 1 thông báo cho giao dịch đã xử lý trước đó.
        assertNull(result.transaction());
        verify(walletRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }
}
