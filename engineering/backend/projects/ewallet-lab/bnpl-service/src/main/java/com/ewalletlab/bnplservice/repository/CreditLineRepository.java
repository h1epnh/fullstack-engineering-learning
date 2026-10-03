package com.ewalletlab.bnplservice.repository;

import com.ewalletlab.bnplservice.domain.CreditLine;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface CreditLineRepository extends JpaRepository<CreditLine, UUID> {

    Optional<CreditLine> findByUserId(UUID userId);

    /** SELECT ... FOR UPDATE — every draw/repayment-claim/revert takes this row lock first, so all
     * mutations of one user's credit line run strictly one after another. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CreditLine c where c.userId = :userId")
    Optional<CreditLine> lockByUserId(@Param("userId") UUID userId);
}
