package com.ewalletlab.investmentfundservice.repository;

import com.ewalletlab.investmentfundservice.domain.InvestmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvestmentOrderRepository extends JpaRepository<InvestmentOrder, UUID> {
    List<InvestmentOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<InvestmentOrder> findByUserIdAndFundIdOrderByCreatedAtDesc(UUID userId, UUID fundId);
}

