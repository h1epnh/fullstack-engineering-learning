package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.TopupRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TopupRequestRepository extends JpaRepository<TopupRequest, UUID> {
    Optional<TopupRequest> findByOrderId(String orderId);
}
