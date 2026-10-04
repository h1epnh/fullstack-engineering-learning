package com.ewalletlab.paymentrequestservice.repository;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestKind;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {
    List<PaymentRequest> findByCreatorUserIdAndKindOrderByCreatedAtDesc(UUID creatorUserId, PaymentRequestKind kind);

    List<PaymentRequest> findByTargetUserIdAndKindOrderByCreatedAtDesc(UUID targetUserId, PaymentRequestKind kind);

    /** Issue #11 — all shares of one split-bill group, in the order they were created (stable
     * display order for the "Danh sách đã thu" screen). */
    List<PaymentRequest> findByGroupIdOrderByCreatedAtAsc(UUID groupId);
}
