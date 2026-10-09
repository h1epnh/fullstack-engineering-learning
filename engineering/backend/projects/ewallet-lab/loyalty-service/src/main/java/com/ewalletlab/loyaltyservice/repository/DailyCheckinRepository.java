package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.DailyCheckin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DailyCheckinRepository extends JpaRepository<DailyCheckin, UUID> {

    Optional<DailyCheckin> findByUserIdAndCheckinDate(UUID userId, LocalDate checkinDate);

    /** Most recent check-in overall — used to compute the next streak day (compare its {@code
     * checkinDate} to today). */
    Optional<DailyCheckin> findTopByUserIdOrderByCheckinDateDesc(UUID userId);
}
