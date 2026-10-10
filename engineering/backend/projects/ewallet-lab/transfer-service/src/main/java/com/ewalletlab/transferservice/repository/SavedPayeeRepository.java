package com.ewalletlab.transferservice.repository;

import com.ewalletlab.transferservice.domain.SavedPayee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedPayeeRepository extends JpaRepository<SavedPayee, UUID> {

    List<SavedPayee> findByUserIdOrderByIsFavoriteDescLastTransferredAtDescCreatedAtDesc(UUID userId);

    Optional<SavedPayee> findByUserIdAndPayeePhone(UUID userId, String payeePhone);

    Optional<SavedPayee> findByUserIdAndId(UUID userId, UUID id);

    boolean existsByUserIdAndPayeePhone(UUID userId, String payeePhone);
}
