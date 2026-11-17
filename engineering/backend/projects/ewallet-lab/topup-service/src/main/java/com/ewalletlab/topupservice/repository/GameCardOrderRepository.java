package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import com.ewalletlab.topupservice.domain.GameCardOrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GameCardOrderRepository extends JpaRepository<GameCardOrder, UUID> {
    List<GameCardOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<GameCardOrder> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, GameCardOrderStatus status);

    Optional<GameCardOrder> findByIdempotencyKey(String idempotencyKey);

    // ---- Atomic fulfiller-claim transitions. Each returns rows affected: 1 = I won, 0 = lost. ----

    /** Take over a stale claim: only one concurrent resumer can swap the observed token. */
    @Modifying(flushAutomatically = true, clearAutomatically = true) // clear: OSIV keeps a request-scoped
    // persistence context; without it a later findById returns the STALE pre-update entity (seen live: 201 with null PIN).
    @Transactional
    @Query("update GameCardOrder o set o.fulfillToken = :newToken, o.fulfillStartedAt = :at "
        + "where o.id = :id and o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.PENDING "
        + "and o.fulfillToken = :oldToken")
    int takeOverIf(@Param("id") UUID id, @Param("oldToken") String oldToken,
                   @Param("newToken") String newToken, @Param("at") Instant at);

    @Modifying(flushAutomatically = true, clearAutomatically = true) // clear: OSIV keeps a request-scoped
    // persistence context; without it a later findById returns the STALE pre-update entity (seen live: 201 with null PIN).
    @Transactional
    @Query("update GameCardOrder o set o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.COMPLETED, "
        + "o.pinCode = :pin, o.serialNumber = :serial, o.expiryDate = :expiry "
        + "where o.id = :id and o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.PENDING "
        + "and o.fulfillToken = :token")
    int completeIf(@Param("id") UUID id, @Param("token") String token, @Param("pin") String pin,
                   @Param("serial") String serial, @Param("expiry") String expiry);

    /** Decide "no card will be issued" — only the current claim holder, only while still PENDING. */
    @Modifying(flushAutomatically = true, clearAutomatically = true) // clear: OSIV keeps a request-scoped
    // persistence context; without it a later findById returns the STALE pre-update entity (seen live: 201 with null PIN).
    @Transactional
    @Query("update GameCardOrder o set o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.FAILED_REFUNDED, "
        + "o.failureReason = :reason "
        + "where o.id = :id and o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.PENDING "
        + "and o.fulfillToken = :token")
    int failForRefundIf(@Param("id") UUID id, @Param("token") String token, @Param("reason") String reason);

    @Modifying(flushAutomatically = true, clearAutomatically = true) // clear: OSIV keeps a request-scoped
    // persistence context; without it a later findById returns the STALE pre-update entity (seen live: 201 with null PIN).
    @Transactional
    @Query("update GameCardOrder o set o.failureReason = :reason "
        + "where o.id = :id and o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.FAILED_REFUNDED")
    int setFailureReason(@Param("id") UUID id, @Param("reason") String reason);

    /** Release the claim after a definitive wallet rejection (nothing debited). */
    @Modifying(flushAutomatically = true, clearAutomatically = true) // clear: OSIV keeps a request-scoped
    // persistence context; without it a later findById returns the STALE pre-update entity (seen live: 201 with null PIN).
    @Transactional
    @Query("delete from GameCardOrder o "
        + "where o.id = :id and o.status = com.ewalletlab.topupservice.domain.GameCardOrderStatus.PENDING "
        + "and o.fulfillToken = :token")
    int deleteClaimIf(@Param("id") UUID id, @Param("token") String token);
}
