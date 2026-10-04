package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.LoyaltyAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, UUID> {

    Optional<LoyaltyAccount> findByUserId(UUID userId);

    /** SELECT ... FOR UPDATE — every sync/redeem-claim/revert of one account runs one at a time.
     * Only works because open-in-view is off (see application.yml). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from LoyaltyAccount a where a.userId = :userId")
    Optional<LoyaltyAccount> lockByUserId(@Param("userId") UUID userId);
}
