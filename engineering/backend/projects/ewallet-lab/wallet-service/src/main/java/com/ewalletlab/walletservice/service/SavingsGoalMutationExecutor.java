package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import com.ewalletlab.walletservice.domain.SavingsGoalStatus;
import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import com.ewalletlab.walletservice.domain.SavingsGoalTransactionType;
import com.ewalletlab.walletservice.repository.SavingsGoalRepository;
import com.ewalletlab.walletservice.repository.SavingsGoalTransactionRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.UUID;

@Component
public class SavingsGoalMutationExecutor {

    private final SavingsGoalRepository savingsGoalRepository;
    private final SavingsGoalTransactionRepository savingsGoalTransactionRepository;

    public SavingsGoalMutationExecutor(SavingsGoalRepository savingsGoalRepository,
                                       SavingsGoalTransactionRepository savingsGoalTransactionRepository) {
        this.savingsGoalRepository = savingsGoalRepository;
        this.savingsGoalTransactionRepository = savingsGoalTransactionRepository;
    }

    @Transactional
    public SavingsGoal depositGoalOnce(UUID goalId, BigDecimal amount) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm"));
        if (goal.getStatus() == SavingsGoalStatus.CANCELLED) {
            throw new IllegalStateException("Mục tiêu tiết kiệm đã bị huỷ, không thể nạp thêm");
        }
        goal.deposit(amount);
        SavingsGoal saved = savingsGoalRepository.save(goal);
        savingsGoalTransactionRepository.save(
            new SavingsGoalTransaction(goalId, amount, SavingsGoalTransactionType.DEPOSIT));
        return saved;
    }

    @Transactional
    public SavingsGoal withdrawClaimOnce(UUID goalId, BigDecimal amount) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm"));
        if (goal.getStatus() == SavingsGoalStatus.CANCELLED) {
            throw new IllegalStateException("Mục tiêu tiết kiệm đã bị huỷ");
        }
        if (goal.getCurrentAmount().compareTo(amount) < 0) {
            throw new IllegalStateException("Số dư mục tiêu không đủ để rút (hiện có %sđ, yêu cầu %sđ)"
                .formatted(goal.getCurrentAmount(), amount));
        }
        goal.withdraw(amount);
        SavingsGoal saved = savingsGoalRepository.save(goal);
        savingsGoalTransactionRepository.save(
            new SavingsGoalTransaction(goalId, amount, SavingsGoalTransactionType.WITHDRAW));
        return saved;
    }

    @Transactional
    public void revertWithdrawClaim(UUID goalId, BigDecimal amount) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
            .orElseThrow(() -> new NoSuchElementException("Không tìm thấy mục tiêu tiết kiệm để hoàn"));
        goal.deposit(amount);
        savingsGoalRepository.save(goal);
    }
}

