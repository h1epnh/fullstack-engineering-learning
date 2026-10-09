package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.DigitalSubscriptionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DigitalSubscriptionRepository extends JpaRepository<DigitalSubscriptionOrder, UUID> {
    List<DigitalSubscriptionOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
