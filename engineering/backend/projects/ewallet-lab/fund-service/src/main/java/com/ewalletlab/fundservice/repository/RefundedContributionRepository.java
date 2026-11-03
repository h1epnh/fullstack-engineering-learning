package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.RefundedContribution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefundedContributionRepository extends JpaRepository<RefundedContribution, String> {
}
