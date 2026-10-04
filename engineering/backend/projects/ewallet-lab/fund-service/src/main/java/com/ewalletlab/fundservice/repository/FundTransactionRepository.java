package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FundTransactionRepository extends JpaRepository<FundTransaction, UUID> {

    List<FundTransaction> findByFundIdOrderByCreatedAtDesc(UUID fundId);
}
