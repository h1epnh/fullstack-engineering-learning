package com.ewalletlab.bnplservice.repository;

import com.ewalletlab.bnplservice.domain.Repayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RepaymentRepository extends JpaRepository<Repayment, UUID> {
    List<Repayment> findByCreditLineIdOrderByCreatedAtDesc(UUID creditLineId);
}
