package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.ExternalExpenseEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExternalExpenseEntryRepository extends JpaRepository<ExternalExpenseEntry, UUID> {
    List<ExternalExpenseEntry> findByUserIdOrderBySpentAtDesc(UUID userId);

    List<ExternalExpenseEntry> findByUserIdAndSpentAtGreaterThanEqualOrderBySpentAtDesc(UUID userId, Instant since);

    List<ExternalExpenseEntry> findByUserIdAndSpentAtBetweenOrderBySpentAtDesc(UUID userId, Instant start, Instant end);
}
