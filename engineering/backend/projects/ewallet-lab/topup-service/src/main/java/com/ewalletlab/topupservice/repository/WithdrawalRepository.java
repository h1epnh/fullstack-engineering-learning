package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WithdrawalRepository extends JpaRepository<Withdrawal, UUID> {
    List<Withdrawal> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
