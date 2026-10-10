package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.MerchantWithdrawalTracker;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface MerchantWithdrawalTrackerRepository extends JpaRepository<MerchantWithdrawalTracker, UUID> {

    Optional<MerchantWithdrawalTracker> findByUserIdAndYearMonth(UUID userId, String yearMonth);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM MerchantWithdrawalTracker t WHERE t.userId = :userId AND t.yearMonth = :yearMonth")
    Optional<MerchantWithdrawalTracker> findWithLockByUserIdAndYearMonth(@Param("userId") UUID userId, @Param("yearMonth") String yearMonth);

    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "INSERT INTO merchant_withdrawal_trackers (id, user_id, year_month, cumulative_withdrawn, updated_at) " +
                   "VALUES (gen_random_uuid(), :userId, :yearMonth, 0, now()) " +
                   "ON CONFLICT (user_id, year_month) DO NOTHING", nativeQuery = true)
    void insertIfAbsent(@Param("userId") UUID userId, @Param("yearMonth") String yearMonth);
}
