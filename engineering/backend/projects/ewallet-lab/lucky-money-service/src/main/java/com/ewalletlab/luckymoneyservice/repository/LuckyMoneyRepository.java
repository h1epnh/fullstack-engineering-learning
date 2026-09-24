package com.ewalletlab.luckymoneyservice.repository;

import com.ewalletlab.luckymoneyservice.domain.LuckyMoney;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LuckyMoneyRepository extends JpaRepository<LuckyMoney, UUID> {
    List<LuckyMoney> findByFromUserIdOrderByCreatedAtDesc(UUID fromUserId);

    List<LuckyMoney> findByToUserIdOrderByCreatedAtDesc(UUID toUserId);
}
