package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.OutboxEvent;
import com.ewalletlab.topupservice.domain.OutboxEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxEventStatus status);
}
