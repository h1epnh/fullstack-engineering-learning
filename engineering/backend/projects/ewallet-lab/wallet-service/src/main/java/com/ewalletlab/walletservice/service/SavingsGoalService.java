package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import com.ewalletlab.walletservice.domain.SavingsGoalStatus;
import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import com.ewalletlab.walletservice.domain.SavingsGoalTransactionType;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.repository.SavingsGoalRepository;
import com.ewalletlab.walletservice.repository.SavingsGoalTransactionRepository;
import com.ewalletlab.walletservice.web.dto.CreateSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.DepositSavingsGoalRequestDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDetailDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalDto;
import com.ewalletlab.walletservice.web.dto.SavingsGoalTransactionDto;
import com.ewalletlab.walletservice.web.dto.WithdrawSavingsGoalRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.function.Supplier;

@Service
public class SavingsGoalService {

    private static final Logger log = LoggerFactory.getLogger(SavingsGoalService.class);
    private static final int MAX_ATTEMPTS = 5;
    private static final long RETRY_BACKOFF_MILLIS = 20;

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsGoalTransactionRepository savingsGoalTransactionRepository;
    private final SavingsGoalMutationExecutor mutationExecutor;
    private final WalletService walletService;

    public SavingsGoalService(SavingsGoalRepository savingsGoalRepository,
                              SavingsGoalTransactionRepository savingsGoalTransactionRepository,
                              SavingsGoalMutationExecutor mutationExecutor,
                              WalletService walletService) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.savingsGoalTransactionRepository = savingsGoalTransactionRepository;
        this.mutationExecutor = mutationExecutor;
        this.walletService = walletService;
    }

    @Transactional
    public SavingsGoalDto createGoal(CreateSavingsGoalRequestDto request) {
        if (request.targetAmount() == null || request.targetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền mục tiêu phải lớn hơn 0");
        }
        if (request.targetDate() == null || request.targetDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Ngày kết thúc không được ở quá khứ");
        }

        SavingsGoal goal = new SavingsGoal(
            request.userId(),
            request.name().trim(),
            request.targetAmount(),
            request.targetDate()
        );
        goal = savingsGoalRepository.save(goal);

        if (request.initialDepositAmount() != null && request.initialDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            walletService.debit(
                request.userId(),
                request.initialDepositAmount(),
                TransactionType.SAVINGS_GOAL_DEPOSIT,
                goal.getId().toString(),
                "Nạp ban đầu vào mục tiêu: " + goal.getName(),
                request.stepUpConfirmed()
            );
            goal.deposit(request.initialDepositAmount());
            goal = savingsGoalRepository.save(goal);
            savingsGoalTransactionRepository.save(
                new SavingsGoalTransaction(goal.getId(), request.initialDepositAmount(), SavingsGoalTransactionType.DEPOSIT));
        }

        return SavingsGoalDto.from(goal);
    }

    public List<SavingsGoalDto> getGoals(UUID userId) {
        return savingsGoalRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(SavingsGoalDto::from)
            .toList();
    }

    public SavingsGoalDetailDto getGoalDetail(UUID goalId) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm: " + goalId));
        List<SavingsGoalTransactionDto> txs = savingsGoalTransactionRepository.findByGoalIdOrderByCreatedAtDesc(goalId)
            .stream()
            .map(SavingsGoalTransactionDto::from)
            .toList();
        return new SavingsGoalDetailDto(SavingsGoalDto.from(goal), txs);
    }

    public SavingsGoalDto deposit(UUID goalId, DepositSavingsGoalRequestDto request) {
        BigDecimal amount = request.amount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền nạp phải lớn hơn 0");
        }

        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm: " + goalId));

        if (goal.getStatus() == SavingsGoalStatus.CANCELLED) {
            throw new IllegalStateException("Mục tiêu tiết kiệm đã bị huỷ, không thể nạp thêm");
        }

        // Bước 1: Trừ tiền từ ví chính
        walletService.debit(
            goal.getUserId(),
            amount,
            TransactionType.SAVINGS_GOAL_DEPOSIT,
            goalId.toString(),
            "Nạp tiền vào mục tiêu: " + goal.getName(),
            request.stepUpConfirmed()
        );

        // Bước 2: Cập nhật số dư mục tiêu (kèm optimistic retry)
        try {
            SavingsGoal updated = withOptimisticLockRetry("deposit", goalId,
                () -> mutationExecutor.depositGoalOnce(goalId, amount));
            return SavingsGoalDto.from(updated);
        } catch (Exception e) {
            log.error("Cập nhật số dư mục tiêu {} thất bại sau khi debit ví, tiến hành bồi hoàn", goalId, e);
            try {
                walletService.credit(
                    goal.getUserId(),
                    amount,
                    TransactionType.SAVINGS_GOAL_WITHDRAW,
                    goalId.toString(),
                    "Hoàn tiền nạp mục tiêu do lỗi hệ thống"
                );
            } catch (Exception refundEx) {
                log.error("Bồi hoàn thất bại cho user {} amount {}", goal.getUserId(), amount, refundEx);
            }
            throw e;
        }
    }

    public SavingsGoalDto withdraw(UUID goalId, WithdrawSavingsGoalRequestDto request) {
        BigDecimal amount = request.amount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền rút phải lớn hơn 0");
        }

        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm: " + goalId));

        // Bước 1: Claim và trừ tiền mục tiêu trước (được bảo vệ bởi @Version và optimistic lock)
        SavingsGoal updatedGoal = withOptimisticLockRetry("withdraw", goalId,
            () -> mutationExecutor.withdrawClaimOnce(goalId, amount));

        // Bước 2: Tiền về ví chính sau khi claim thành công
        try {
            walletService.credit(
                updatedGoal.getUserId(),
                amount,
                TransactionType.SAVINGS_GOAL_WITHDRAW,
                goalId.toString(),
                "Rút tiền từ mục tiêu: " + updatedGoal.getName()
            );
        } catch (Exception e) {
            log.error("Credit ví chính cho user {} thất bại sau khi claim rút mục tiêu {}, hoàn lại mục tiêu",
                updatedGoal.getUserId(), goalId, e);
            mutationExecutor.revertWithdrawClaim(goalId, amount);
            throw e;
        }

        return SavingsGoalDto.from(updatedGoal);
    }

    private <T> T withOptimisticLockRetry(String op, UUID goalId, Supplier<T> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} on savings goal {} lost optimistic-lock race {} times, surfacing 409",
                        op, goalId, MAX_ATTEMPTS);
                    throw e;
                }
                log.debug("{} on savings goal {} lost optimistic-lock race, retrying attempt {}/{}",
                    op, goalId, i, MAX_ATTEMPTS);
                sleep(RETRY_BACKOFF_MILLIS * i);
            }
        }
        throw new IllegalStateException("unreachable");
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

