package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import com.ewalletlab.walletservice.domain.SavingsGoalStatus;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record SavingsGoalDto(
    UUID id,
    UUID userId,
    String name,
    BigDecimal targetAmount,
    BigDecimal currentAmount,
    LocalDate targetDate,
    SavingsGoalStatus status,
    BigDecimal progressPct,
    Instant createdAt,
    Instant updatedAt
) {
    public static SavingsGoalDto from(SavingsGoal goal) {
        BigDecimal progressPct = BigDecimal.ZERO;
        if (goal.getTargetAmount() != null && goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            progressPct = goal.getCurrentAmount()
                .multiply(BigDecimal.valueOf(100))
                .divide(goal.getTargetAmount(), 2, RoundingMode.HALF_UP);
            if (progressPct.compareTo(BigDecimal.valueOf(100)) > 0) {
                progressPct = BigDecimal.valueOf(100);
            }
        }
        return new SavingsGoalDto(
            goal.getId(),
            goal.getUserId(),
            goal.getName(),
            goal.getTargetAmount(),
            goal.getCurrentAmount(),
            goal.getTargetDate(),
            goal.getStatus(),
            progressPct,
            goal.getCreatedAt(),
            goal.getUpdatedAt()
        );
    }
}

