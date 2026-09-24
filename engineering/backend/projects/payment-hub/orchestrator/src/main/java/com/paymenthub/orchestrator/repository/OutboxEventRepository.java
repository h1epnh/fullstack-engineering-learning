package com.paymenthub.orchestrator.repository;

import com.paymenthub.orchestrator.domain.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {
    List<OutboxEvent> findTop50ByPublishedAtIsNullOrderByCreatedAtAsc();
}
