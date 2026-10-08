package com.ewalletlab.investmentfundservice.repository;

import com.ewalletlab.investmentfundservice.domain.NavHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NavHistoryRepository extends JpaRepository<NavHistory, UUID> {
    List<NavHistory> findByFundIdOrderByRecordedAtDesc(UUID fundId);
}

