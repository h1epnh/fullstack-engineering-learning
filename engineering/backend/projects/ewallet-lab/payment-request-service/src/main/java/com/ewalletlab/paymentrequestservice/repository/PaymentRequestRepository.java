package com.ewalletlab.paymentrequestservice.repository;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestKind;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {
    List<PaymentRequest> findByCreatorUserIdAndKindOrderByCreatedAtDesc(UUID creatorUserId, PaymentRequestKind kind);

    List<PaymentRequest> findByTargetUserIdAndKindOrderByCreatedAtDesc(UUID targetUserId, PaymentRequestKind kind);
}
