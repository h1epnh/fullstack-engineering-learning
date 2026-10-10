package com.ewalletlab.transferservice.repository;

import com.ewalletlab.transferservice.domain.RecurringTransfer;
import com.ewalletlab.transferservice.domain.RecurringTransferStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RecurringTransferRepository extends JpaRepository<RecurringTransfer, UUID> {

    List<RecurringTransfer> findBySenderIdOrderByCreatedAtDesc(UUID senderId);

    List<RecurringTransfer> findByStatusAndNextExecutionDateLessThanEqual(RecurringTransferStatus status, LocalDate date);
}
