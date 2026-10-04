package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.Fund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FundRepository extends JpaRepository<Fund, UUID> {
}
