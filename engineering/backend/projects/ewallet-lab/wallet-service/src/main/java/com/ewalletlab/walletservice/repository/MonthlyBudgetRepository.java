package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, UUID> {
    List<MonthlyBudget> findByUserIdAndMonth(UUID userId, String month);

    Optional<MonthlyBudget> findByUserIdAndMonthAndCategoryCode(UUID userId, String month, String categoryCode);
}
