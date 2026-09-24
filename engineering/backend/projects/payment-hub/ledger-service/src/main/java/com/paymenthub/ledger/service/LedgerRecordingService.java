package com.paymenthub.ledger.service;

import com.paymenthub.ledger.domain.EntryStatus;
import com.paymenthub.ledger.domain.EntryType;
import com.paymenthub.ledger.domain.LedgerEntry;
import com.paymenthub.ledger.repository.LedgerEntryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Double-entry bookkeeping for the payment hub. Every posting is exactly two rows: a DEBIT on the
 * source account and a CREDIT on the destination account, for the same amount/currency — that's
 * what "double-entry" means, and it's why {@link #recordProvisional} always inserts a pair, never
 * a single row.
 */
@Service
public class LedgerRecordingService {

    private static final Logger log = LoggerFactory.getLogger(LedgerRecordingService.class);

    private final LedgerEntryRepository repository;

    public LedgerRecordingService(LedgerEntryRepository repository) {
        this.repository = repository;
    }

    /** Called when the orchestrator routes a transaction — before the rail confirms settlement. */
    @Transactional
    public void recordProvisional(UUID transactionId, String sourceAccount, String destAccount,
                                   BigDecimal amount, String currency) {
        if (!repository.findByTransactionIdOrderByCreatedAtAsc(transactionId).isEmpty()) {
            log.warn("provisional entries already exist for tx={}, skipping duplicate posting", transactionId);
            return;
        }
        repository.save(new LedgerEntry(transactionId, sourceAccount, EntryType.DEBIT, amount, currency, EntryStatus.PROVISIONAL));
        repository.save(new LedgerEntry(transactionId, destAccount, EntryType.CREDIT, amount, currency, EntryStatus.PROVISIONAL));
    }

    /** Called when a rail adapter confirms settlement succeeded. */
    @Transactional
    public void finalizeEntries(UUID transactionId) {
        List<LedgerEntry> entries = provisionalEntriesFor(transactionId);
        if (entries.isEmpty()) {
            log.warn("no provisional entries found to finalize for tx={}", transactionId);
            return;
        }
        // JPA-managed entities: mutating status here and letting the transaction commit persists
        // it — no explicit save() call needed since these came from repository.findBy... within
        // this same @Transactional method.
        entries.forEach(entry -> entry.applyStatus(EntryStatus.FINAL));
    }

    /**
     * Called when a rail adapter confirms settlement failed. Marks the provisional entries
     * REVERSED and posts a compensating pair (debit/credit swapped) so the net effect on both
     * accounts is zero — the provisional rows are never deleted, per DESIGN.md's audit-trail
     * requirement.
     */
    @Transactional
    public void reverse(UUID transactionId) {
        List<LedgerEntry> entries = provisionalEntriesFor(transactionId);
        if (entries.isEmpty()) {
            log.warn("no provisional entries found to reverse for tx={}", transactionId);
            return;
        }
        entries.forEach(entry -> entry.applyStatus(EntryStatus.REVERSED));

        for (LedgerEntry entry : entries) {
            EntryType opposite = entry.getEntryType() == EntryType.DEBIT ? EntryType.CREDIT : EntryType.DEBIT;
            repository.save(new LedgerEntry(
                transactionId, entry.getAccountId(), opposite, entry.getAmount(), entry.getCurrency(), EntryStatus.FINAL));
        }
    }

    private List<LedgerEntry> provisionalEntriesFor(UUID transactionId) {
        return repository.findByTransactionIdOrderByCreatedAtAsc(transactionId).stream()
            .filter(e -> e.getStatus() == EntryStatus.PROVISIONAL)
            .toList();
    }
}
