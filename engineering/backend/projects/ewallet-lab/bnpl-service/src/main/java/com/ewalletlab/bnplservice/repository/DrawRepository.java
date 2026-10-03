package com.ewalletlab.bnplservice.repository;

import com.ewalletlab.bnplservice.domain.Draw;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DrawRepository extends JpaRepository<Draw, UUID> {
    List<Draw> findByCreditLineIdOrderByCreatedAtDesc(UUID creditLineId);
}
