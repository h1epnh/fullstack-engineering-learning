package com.ewalletlab.bnplservice.repository;

import com.ewalletlab.bnplservice.domain.Statement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StatementRepository extends JpaRepository<Statement, UUID> {

    /** Oldest first — repayments are allocated in this order. */
    List<Statement> findByCreditLineIdOrderByPeriodAsc(UUID creditLineId);

    Optional<Statement> findByCreditLineIdAndPeriod(UUID creditLineId, String period);
}
