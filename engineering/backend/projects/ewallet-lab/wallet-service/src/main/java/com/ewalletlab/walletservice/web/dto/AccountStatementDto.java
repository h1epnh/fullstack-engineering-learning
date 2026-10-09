package com.ewalletlab.walletservice.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Issue #36 — shape specified exactly in the ticket's Task #1. Invariant guaranteed by {@code
 * WalletService#statement}'s construction (not just asserted by convention): {@code
 * openingBalance + totalCredits - totalDebits == closingBalance}, always, because {@code
 * closingBalance} is computed FROM the other 3, never queried independently — there's no way for
 * them to disagree. */
public record AccountStatementDto(UUID walletId, UUID userId, String period, BigDecimal openingBalance,
                                   BigDecimal totalCredits, BigDecimal totalDebits, BigDecimal closingBalance,
                                   int transactionsCount, List<StatementTransactionDto> transactions,
                                   Instant generatedAt) {
}
