package com.ewalletlab.fundservice.repository;

import com.ewalletlab.fundservice.domain.FundTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FundTransactionRepository extends JpaRepository<FundTransaction, UUID> {

    List<FundTransaction> findByFundIdOrderByCreatedAtDesc(UUID fundId);

    /** Issue #60 — contribute idempotency lookup. */
    Optional<FundTransaction> findByIdempotencyKey(String idempotencyKey);

    /** Issue #60 R1/R1b — per-debitKey serialization point: a Postgres transaction-scoped advisory
     * lock, released automatically at commit/rollback of the CALLING transaction (so it must be
     * called from inside one). Both {@code contributeOnce} and the refund decision use this exact
     * expression. {@code hashtext} may collide for different keys; a collision only makes two
     * unrelated requests wait for each other briefly, never produces a wrong result. */
    @Query(value = "SELECT count(*) FROM (SELECT pg_advisory_xact_lock(hashtext(:key))) t", nativeQuery = true)
    long lockKey(@Param("key") String key);
}
