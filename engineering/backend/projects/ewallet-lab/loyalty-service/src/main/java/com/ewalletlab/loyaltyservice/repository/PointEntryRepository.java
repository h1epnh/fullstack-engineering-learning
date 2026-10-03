package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.PointEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface PointEntryRepository extends JpaRepository<PointEntry, UUID> {

    List<PointEntry> findByAccountIdOrderByCreatedAtDesc(UUID accountId);

    List<PointEntry> findBySourceTransactionIdIn(Collection<UUID> ids);

    default Set<UUID> alreadyEarned(Collection<UUID> ids) {
        return ids.isEmpty() ? Set.of()
            : findBySourceTransactionIdIn(ids).stream().map(PointEntry::getSourceTransactionId)
                .collect(java.util.stream.Collectors.toSet());
    }
}
