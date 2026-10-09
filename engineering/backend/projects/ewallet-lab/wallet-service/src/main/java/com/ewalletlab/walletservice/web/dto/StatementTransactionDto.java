package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionDirection;
import com.ewalletlab.walletservice.domain.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Issue #36 — one row of {@code AccountStatementDto.transactions}, {@link Transaction} plus the
 * 2 fields a statement needs that the ledger row itself doesn't carry: {@code direction} (so the
 * frontend doesn't have to import/duplicate the IN/OUT classification) and {@code balanceAfter}
 * (the running wallet balance immediately after this transaction — "Số dư sau GD" in the ticket's
 * required CSV columns), computed by {@code WalletService#statement} by walking the period's
 * transactions forward from the opening balance. */
public record StatementTransactionDto(UUID id, TransactionType type, TransactionDirection direction,
                                       BigDecimal amount, String reference, String note, Instant createdAt,
                                       BigDecimal balanceAfter) {
    public static StatementTransactionDto of(Transaction tx, BigDecimal balanceAfter) {
        return new StatementTransactionDto(tx.getId(), tx.getType(), tx.getType().direction(), tx.getAmount(),
            tx.getReference(), tx.getNote(), tx.getCreatedAt(), balanceAfter);
    }
}
