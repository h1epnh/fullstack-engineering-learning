package com.ewalletlab.investmentfundservice.repository;

import com.ewalletlab.investmentfundservice.domain.InvestmentHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvestmentHoldingRepository extends JpaRepository<InvestmentHolding, UUID> {
    Optional<InvestmentHolding> findByUserIdAndFundId(UUID userId, UUID fundId);
    List<InvestmentHolding> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}

