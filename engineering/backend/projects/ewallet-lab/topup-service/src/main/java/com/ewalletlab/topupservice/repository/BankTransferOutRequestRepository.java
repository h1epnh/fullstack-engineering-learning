package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface BankTransferOutRequestRepository extends JpaRepository<BankTransferOutRequest, UUID> {
    Optional<BankTransferOutRequest> findByOrderId(String orderId);

    /**
     * Atomic compare-and-set PENDING -> {to} (issue #52, race fix). A single conditional UPDATE, so of N
     * concurrent valid IPNs for one order exactly one gets 1 back; only that caller may publish/refund.
     */
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("update BankTransferOutRequest r set r.status = :to where r.orderId = :orderId and r.status = com.ewalletlab.topupservice.domain.TopupStatus.PENDING")
    int transitionFromPending(@Param("orderId") String orderId, @Param("to") TopupStatus to);
}
