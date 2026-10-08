package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.SavingsGoalTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingsGoalTransactionRepository extends JpaRepository<SavingsGoalTransaction, UUID> {
    List<SavingsGoalTransaction> findByGoalIdOrderByCreatedAtDesc(UUID goalId);
}

