package com.ewalletlab.investmentfundservice.repository;

import com.ewalletlab.investmentfundservice.domain.InvestmentFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvestmentFundRepository extends JpaRepository<InvestmentFund, UUID> {
    Optional<InvestmentFund> findByCode(String code);
}

