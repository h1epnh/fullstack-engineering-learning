package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** {@code JpaSpecificationExecutor} (issue #36) backs {@code GET
 * /wallets/{userId}/transactions/search}'s optional type/direction/date-range filters +
 * pagination — see {@code TransactionSpecifications} for the actual predicate-building. Plain
 * Spring Data derived-query methods can't express "any of these filters, each independently
 * optional" without a combinatorial explosion of method names; a dynamic JPQL string has the same
 * problem without the type-safety. Specifications are the standard Spring Data answer to exactly
 * this shape. */
public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

    /** Issue #22 — idempotency lookup backing {@code WalletMutationExecutor}/{@code WalletService}'s
     * dedupe check (see {@code Transaction.idempotencyKey}'s javadoc). */
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    /**
     * Cumulative amount for a wallet across a set of transaction types since a given instant —
     * backs the monthly outbound-transaction limit (issue #7, Điều 26 Thông tư 40/2024/TT-NHNN,
     * sửa bởi Thông tư 41/2025/TT-NHNN). {@code COALESCE} handles the "no transactions yet this
     * month" case, which would otherwise sum to SQL NULL rather than 0.
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :since")
    BigDecimal sumAmountByWalletIdAndTypeInSince(@Param("walletId") UUID walletId,
                                                  @Param("types") Collection<TransactionType> types,
                                                  @Param("since") Instant since);

    /**
     * Issue #36 — half-open interval {@code [fromInclusive, toExclusive)}, backing both the
     * opening-balance computation (types IN a direction, {@code fromInclusive = Instant.EPOCH},
     * {@code toExclusive = periodStart}) and the in-period credit/debit totals ({@code
     * fromInclusive = periodStart}, {@code toExclusive = next month's start}) on {@code GET
     * /wallets/{userId}/statement}. Deliberately NOT reusing {@link #sumAmountByWalletIdAndTypeInSince}
     * (open-ended "since now") — a statement needs a bounded window, not "everything up to now".
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :fromInclusive AND t.createdAt < :toExclusive")
    BigDecimal sumAmountByWalletIdAndTypeInBetween(@Param("walletId") UUID walletId,
                                                    @Param("types") Collection<TransactionType> types,
                                                    @Param("fromInclusive") Instant fromInclusive,
                                                    @Param("toExclusive") Instant toExclusive);

    /** Issue #36 — the statement's full detail table: every transaction in the period, oldest
     * first (so a running balance can be accumulated forward from the opening balance in display
     * order). */
    List<Transaction> findByWalletIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtAsc(
        UUID walletId, Instant fromInclusive, Instant toExclusive);

    /**
     * Issue #16 — breakdown-by-type backing {@code GET /wallets/{userId}/spending-report}. Group-by
     * at the DB layer rather than loading the full transaction list and reducing in Java (ledger is
     * small for this lab, but this is the honest choice per the issue's note on query strategy).
     * Types not present in the period simply don't appear in the result — the service layer fills
     * in zero for any of the 3 spend types missing here so the response always has a stable shape.
     */
    @Query("SELECT t.type AS type, COALESCE(SUM(t.amount), 0) AS total FROM Transaction t "
        + "WHERE t.walletId = :walletId AND t.type IN :types AND t.createdAt >= :since "
        + "GROUP BY t.type")
    List<SpendingBreakdownRow> sumAmountGroupedByTypeSince(@Param("walletId") UUID walletId,
                                                            @Param("types") Collection<TransactionType> types,
                                                            @Param("since") Instant since);

    interface SpendingBreakdownRow {
        TransactionType getType();

        BigDecimal getTotal();
    }
}
