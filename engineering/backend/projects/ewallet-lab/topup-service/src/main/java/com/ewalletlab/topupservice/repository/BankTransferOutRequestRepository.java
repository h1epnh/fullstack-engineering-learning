package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BankTransferOutRequestRepository extends JpaRepository<BankTransferOutRequest, UUID> {
    Optional<BankTransferOutRequest> findByOrderId(String orderId);
}
