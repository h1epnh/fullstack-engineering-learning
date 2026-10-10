package com.ewalletlab.transferservice.repository;

import com.ewalletlab.transferservice.domain.RecurringTransferLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecurringTransferLogRepository extends JpaRepository<RecurringTransferLog, UUID> {

    List<RecurringTransferLog> findByRecurringTransferIdOrderByExecutedAtDesc(UUID recurringTransferId);
}
