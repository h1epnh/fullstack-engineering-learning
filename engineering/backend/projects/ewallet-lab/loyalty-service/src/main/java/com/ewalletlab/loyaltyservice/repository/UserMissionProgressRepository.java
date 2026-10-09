package com.ewalletlab.loyaltyservice.repository;

import com.ewalletlab.loyaltyservice.domain.UserMissionProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserMissionProgressRepository extends JpaRepository<UserMissionProgress, UUID> {

    Optional<UserMissionProgress> findByUserIdAndMissionCodeAndTargetDate(UUID userId, String missionCode, LocalDate targetDate);

    List<UserMissionProgress> findByUserIdAndTargetDate(UUID userId, LocalDate targetDate);
}
