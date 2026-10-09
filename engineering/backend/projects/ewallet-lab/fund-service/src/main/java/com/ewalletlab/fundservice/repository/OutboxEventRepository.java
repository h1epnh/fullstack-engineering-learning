package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.OutboxEvent;
import com.ewalletlab.fundservice.domain.OutboxEventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, UUID> {

    /** Oldest-first so a long-stuck event doesn't keep getting pushed behind a stream of newer
     * ones — not that it matters much at this lab's scale, but it's the honest choice. Single
     * fund-service replica assumed (see DESIGN.md's "Outbox pattern" section) — no {@code SELECT
     * ... FOR UPDATE SKIP LOCKED} needed since nothing else ever reads/writes a {@code PENDING} row
     * concurrently with the relay. */
    List<OutboxEvent> findByStatusOrderByCreatedAtAsc(OutboxEventStatus status);
}
