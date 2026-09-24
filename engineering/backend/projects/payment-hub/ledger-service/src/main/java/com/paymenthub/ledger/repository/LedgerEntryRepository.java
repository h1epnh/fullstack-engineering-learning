package com.paymenthub.ledger.repository;

import com.paymenthub.ledger.domain.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findByTransactionIdOrderByCreatedAtAsc(UUID transactionId);
}
