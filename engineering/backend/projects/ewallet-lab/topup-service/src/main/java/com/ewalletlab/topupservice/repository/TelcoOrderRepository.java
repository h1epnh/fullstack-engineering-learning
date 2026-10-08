package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.TelcoOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TelcoOrderRepository extends JpaRepository<TelcoOrder, UUID> {
    List<TelcoOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
