package com.paymenthub.ledger.web;

import com.paymenthub.ledger.domain.LedgerEntry;
import com.paymenthub.ledger.repository.LedgerEntryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ledger")
public class LedgerController {

    private final LedgerEntryRepository repository;

    public LedgerController(LedgerEntryRepository repository) {
        this.repository = repository;
    }

    /** All entries (provisional, final, and any reversal pair) for one transaction, oldest first. */
    @GetMapping("/{transactionId}")
    public List<LedgerEntry> getEntries(@PathVariable UUID transactionId) {
        return repository.findByTransactionIdOrderByCreatedAtAsc(transactionId);
    }
}
