package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.CustomSpendingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomSpendingCategoryRepository extends JpaRepository<CustomSpendingCategory, UUID> {
    List<CustomSpendingCategory> findByUserIdOrderByCreatedAtAsc(UUID userId);

    Optional<CustomSpendingCategory> findByUserIdAndCode(UUID userId, String code);
}
