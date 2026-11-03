package com.ewalletlab.walletservice.repository;

import com.ewalletlab.walletservice.domain.TransactionCategoryOverride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionCategoryOverrideRepository extends JpaRepository<TransactionCategoryOverride, UUID> {
    List<TransactionCategoryOverride> findByUserId(UUID userId);

    Optional<TransactionCategoryOverride> findByUserIdAndTransactionId(UUID userId, UUID transactionId);
}
