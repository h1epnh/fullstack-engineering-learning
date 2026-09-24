package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    List<Transaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId);

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
}
