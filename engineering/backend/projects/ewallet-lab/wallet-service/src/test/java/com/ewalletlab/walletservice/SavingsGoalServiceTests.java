package com.ewalletlab.walletservice;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import com.ewalletlab.walletservice.domain.SavingsGoalStatus;
import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import com.ewalletlab.walletservice.domain.SavingsGoalTransactionType;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.repository.SavingsGoalRepository;
import com.ewalletlab.walletservice.repository.SavingsGoalTransactionRepository;
import com.ewalletlab.walletservice.service.SavingsGoalMutationExecutor;
import com.ewalletlab.walletservice.service.SavingsGoalService;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.CreateSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.DepositSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDetailDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDto;
import com.ewalletlab.walletservice.web.dto.WithdrawSavingsGoalRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavingsGoalServiceTests {

    @Mock
    private SavingsGoalRepository savingsGoalRepository;

    @Mock
    private SavingsGoalTransactionRepository savingsGoalTransactionRepository;

    @Mock
    private SavingsGoalMutationExecutor mutationExecutor;

    @Mock
    private WalletService walletService;

    private SavingsGoalService savingsGoalService;

    @BeforeEach
    void setUp() {
        savingsGoalService = new SavingsGoalService(
            savingsGoalRepository,
            savingsGoalTransactionRepository,
            mutationExecutor,
            walletService
        );
    }

    @Test
    @DisplayName("Tạo mục tiêu thành công kèm số tiền nạp ban đầu")
    void testCreateGoalWithInitialDeposit() {
        UUID userId = UUID.randomUUID();
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, "Mua xe máy", new BigDecimal("30000000"), LocalDate.now().plusMonths(6),
            new BigDecimal("5000000"), false
        );

        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> {
            SavingsGoal g = invocation.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(g, "id", UUID.randomUUID());
            return g;
        });

        SavingsGoalDto result = savingsGoalService.createGoal(req);

        assertNotNull(result);
        assertEquals("Mua xe máy", result.name());
        assertEquals(new BigDecimal("30000000"), result.targetAmount());
        assertEquals(new BigDecimal("5000000"), result.currentAmount());
        assertEquals(SavingsGoalStatus.ACTIVE, result.status());

        verify(walletService).debit(
            eq(userId), eq(new BigDecimal("5000000")), eq(TransactionType.SAVINGS_GOAL_DEPOSIT),
            any(), any(), eq(false)
        );
        verify(savingsGoalTransactionRepository).save(any(SavingsGoalTransaction.class));
    }

    @Test
    @DisplayName("Nạp thêm tiền vào mục tiêu và tự động chuyển sang COMPLETED khi đạt số tiền đích")
    void testDepositReachingTargetAmount() {
        UUID goalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        SavingsGoal goal = new SavingsGoal(userId, "Mua điện thoại", new BigDecimal("10000000"), LocalDate.now().plusMonths(3));
        goal.deposit(new BigDecimal("8000000")); // currentAmount = 8tr

        when(savingsGoalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        // MutationExecutor thực hiện cộng thêm 2tr -> đạt 10tr -> COMPLETED
        SavingsGoal updatedGoal = new SavingsGoal(userId, "Mua điện thoại", new BigDecimal("10000000"), LocalDate.now().plusMonths(3));
        updatedGoal.deposit(new BigDecimal("10000000"));

        when(mutationExecutor.depositGoalOnce(eq(goalId), eq(new BigDecimal("2000000")))).thenReturn(updatedGoal);

        DepositSavingsGoalRequestDto req = new DepositSavingsGoalRequestDto(new BigDecimal("2000000"), false);
        SavingsGoalDto result = savingsGoalService.deposit(goalId, req);

        assertNotNull(result);
        assertEquals(SavingsGoalStatus.COMPLETED, result.status());
        assertEquals(new BigDecimal("10000000"), result.currentAmount());
        assertEquals(new BigDecimal("100.00"), result.progressPct());

        verify(walletService).debit(eq(userId), eq(new BigDecimal("2000000")), eq(TransactionType.SAVINGS_GOAL_DEPOSIT), any(), any(), eq(false));
    }

    @Test
    @DisplayName("Nạp vượt 10.000.000đ yêu cầu Step-up xác thực (QĐ 2345)")
    void testDepositStepUpRequired() {
        UUID goalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        SavingsGoal goal = new SavingsGoal(userId, "Mua laptop", new BigDecimal("50000000"), LocalDate.now().plusMonths(12));

        when(savingsGoalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        doThrow(new StepUpRequiredException("Cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN"))
            .when(walletService).debit(eq(userId), eq(new BigDecimal("15000000")), eq(TransactionType.SAVINGS_GOAL_DEPOSIT), any(), any(), eq(false));

        DepositSavingsGoalRequestDto req = new DepositSavingsGoalRequestDto(new BigDecimal("15000000"), false);
        assertThrows(StepUpRequiredException.class, () -> savingsGoalService.deposit(goalId, req));

        verify(mutationExecutor, never()).depositGoalOnce(any(), any());
    }

    @Test
    @DisplayName("Rút tiền từ mục tiêu về ví chính thành công")
    void testWithdrawSuccess() {
        UUID goalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        SavingsGoal goal = new SavingsGoal(userId, "Mua máy ảnh", new BigDecimal("20000000"), LocalDate.now().plusMonths(4));
        goal.deposit(new BigDecimal("15000000"));

        when(savingsGoalRepository.findById(goalId)).thenReturn(Optional.of(goal));

        SavingsGoal claimedGoal = new SavingsGoal(userId, "Mua máy ảnh", new BigDecimal("20000000"), LocalDate.now().plusMonths(4));
        claimedGoal.deposit(new BigDecimal("10000000")); // Sau khi rút 5tr còn 10tr

        when(mutationExecutor.withdrawClaimOnce(eq(goalId), eq(new BigDecimal("5000000")))).thenReturn(claimedGoal);

        WithdrawSavingsGoalRequestDto req = new WithdrawSavingsGoalRequestDto(new BigDecimal("5000000"));
        SavingsGoalDto result = savingsGoalService.withdraw(goalId, req);

        assertNotNull(result);
        assertEquals(new BigDecimal("10000000"), result.currentAmount());

        verify(mutationExecutor).withdrawClaimOnce(eq(goalId), eq(new BigDecimal("5000000")));
        verify(walletService).credit(eq(userId), eq(new BigDecimal("5000000")), eq(TransactionType.SAVINGS_GOAL_WITHDRAW), any(), any());
    }

    @Test
    @DisplayName("Rút quá số dư mục tiêu bị chặn với IllegalStateException")
    void testWithdrawExceedingCurrentAmount() {
        UUID goalId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        SavingsGoal goal = new SavingsGoal(userId, "Du lịch", new BigDecimal("10000000"), LocalDate.now().plusMonths(2));
        goal.deposit(new BigDecimal("2000000")); // Chỉ có 2tr

        when(savingsGoalRepository.findById(goalId)).thenReturn(Optional.of(goal));
        when(mutationExecutor.withdrawClaimOnce(eq(goalId), eq(new BigDecimal("5000000"))))
            .thenThrow(new IllegalStateException("Số dư mục tiêu không đủ để rút"));

        WithdrawSavingsGoalRequestDto req = new WithdrawSavingsGoalRequestDto(new BigDecimal("5000000"));
        assertThrows(IllegalStateException.class, () -> savingsGoalService.withdraw(goalId, req));

        verify(walletService, never()).credit(any(), any(), any(), any(), any());
    }
}

