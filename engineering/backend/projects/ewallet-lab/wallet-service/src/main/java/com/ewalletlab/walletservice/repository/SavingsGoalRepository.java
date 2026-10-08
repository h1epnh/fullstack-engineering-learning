package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findByUserIdOrderByCreatedAtDesc(UUID userId);
}

