package com.ewalletlab.walletservice;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import com.ewalletlab.walletservice.domain.SavingsGoalStatus;
import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import com.ewalletlab.walletservice.domain.SavingsGoalTransactionType;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.SavingsGoalRepository;
import com.ewalletlab.walletservice.repository.SavingsGoalTransactionRepository;
import com.ewalletlab.walletservice.repository.WalletRepository;
import com.ewalletlab.walletservice.service.SavingsGoalMutationExecutor;
import com.ewalletlab.walletservice.service.SavingsGoalService;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.service.UserServiceClient;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.CreateSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.DepositSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDetailDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDto;
import com.ewalletlab.walletservice.web.dto.WithdrawSavingsGoalRequestDto;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
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
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
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

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserServiceClient userServiceClient;

    private SavingsGoalService savingsGoalService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        savingsGoalService = new SavingsGoalService(
            savingsGoalRepository,
            savingsGoalTransactionRepository,
            mutationExecutor,
            walletService,
            walletRepository,
            userServiceClient
        );
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }


    @Test
    @DisplayName("Tạo mục tiêu thành công kèm số tiền nạp ban đầu")
    void testCreateGoalWithInitialDeposit() {
        UUID userId = UUID.randomUUID();
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, "Mua xe máy", new BigDecimal("30000000"), LocalDate.now().plusMonths(6),
            new BigDecimal("5000000"), false
        );

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(new Wallet(userId)));
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

    @Test
    @DisplayName("Tên mục tiêu 101 ký tự vi phạm Bean Validation và Service ném IllegalArgumentException")
    void testCreateGoalNameExceeds100Chars() {
        UUID userId = UUID.randomUUID();
        String longName = "A".repeat(101);
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, longName, new BigDecimal("10000000"), LocalDate.now().plusMonths(3),
            BigDecimal.ZERO, false
        );

        // 1. Kiểm tra Bean Validation (@Size(max = 100))
        Set<ConstraintViolation<CreateSavingsGoalRequestDto>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Phải có lỗi validation khi tên mục tiêu > 100 ký tự");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("name")));

        // 2. Kiểm tra Service phòng thủ
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> savingsGoalService.createGoal(req));
        assertTrue(ex.getMessage().contains("Tên mục tiêu không được vượt quá 100 ký tự"));
    }

    @Test
    @DisplayName("Số tiền mục tiêu vượt quá trần 200.000.000đ vi phạm Bean Validation và Service ném IllegalArgumentException")
    void testCreateGoalTargetAmountExceedsCeiling() {
        UUID userId = UUID.randomUUID();
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, "Mục tiêu siêu lớn", new BigDecimal("200000001"), LocalDate.now().plusMonths(3),
            BigDecimal.ZERO, false
        );

        // 1. Kiểm tra Bean Validation (@DecimalMax("200000000"))
        Set<ConstraintViolation<CreateSavingsGoalRequestDto>> violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Phải có lỗi validation khi targetAmount > 200.000.000đ");
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("targetAmount")));

        // 2. Kiểm tra Service phòng thủ
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> savingsGoalService.createGoal(req));
        assertTrue(ex.getMessage().contains("Số tiền mục tiêu tối đa là 200.000.000đ"));
    }

    @Test
    @DisplayName("UserId lạ không tồn tại cả ở ví và user-service thì ném NoSuchElementException (404)")
    void testCreateGoalUserDoesNotExist_ThrowsNoSuchElementException() {
        UUID userId = UUID.randomUUID();
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, "Mục tiêu hợp lệ", new BigDecimal("10000000"), LocalDate.now().plusMonths(3),
            BigDecimal.ZERO, false
        );

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userServiceClient.findUser(userId)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(NoSuchElementException.class, () -> savingsGoalService.createGoal(req));
        assertTrue(ex.getMessage().contains("Không tìm thấy người dùng hoặc ví cho userId: " + userId));

        verify(savingsGoalRepository, never()).save(any());
    }

    @Test
    @DisplayName("UserId chưa có ví nhưng tồn tại ở user-service thì tạo ví mới và tạo mục tiêu thành công")
    void testCreateGoalUserExistsInUserService_CreatesWalletAndGoal() {
        UUID userId = UUID.randomUUID();
        CreateSavingsGoalRequestDto req = new CreateSavingsGoalRequestDto(
            userId, "Mục tiêu từ user mới", new BigDecimal("10000000"), LocalDate.now().plusMonths(3),
            BigDecimal.ZERO, false
        );

        when(walletRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userServiceClient.findUser(userId)).thenReturn(Optional.of(
            new UserServiceClient.UserResponse(userId, "0912345678", "Nguyễn Văn A", "VERIFIED", "123456789")
        ));
        when(walletService.getOrCreateWallet(userId)).thenReturn(new Wallet(userId));
        when(savingsGoalRepository.save(any(SavingsGoal.class))).thenAnswer(invocation -> {
            SavingsGoal g = invocation.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(g, "id", UUID.randomUUID());
            return g;
        });

        SavingsGoalDto result = savingsGoalService.createGoal(req);

        assertNotNull(result);
        assertEquals("Mục tiêu từ user mới", result.name());
        verify(walletService).getOrCreateWallet(userId);
        verify(savingsGoalRepository).save(any(SavingsGoal.class));
    }
}


