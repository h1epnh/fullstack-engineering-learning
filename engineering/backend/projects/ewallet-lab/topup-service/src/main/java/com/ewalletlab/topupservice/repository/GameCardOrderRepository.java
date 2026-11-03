package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface GameCardOrderRepository extends JpaRepository<GameCardOrder, UUID> {
    List<GameCardOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
