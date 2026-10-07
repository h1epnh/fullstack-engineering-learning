package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundCompensationFailure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FundCompensationFailureRepository extends JpaRepository<FundCompensationFailure, UUID> {

    List<FundCompensationFailure> findByResolvedAtIsNull();
}
