package com.ewalletlab.paymentrequestservice.web.dto;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestKind;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentRequestDto(
    UUID id,
    PaymentRequestKind kind,
    UUID creatorUserId,
    String creatorName,
    String creatorPhone,
    UUID targetUserId,
    String targetPhone,
    BigDecimal amount,
    String message,
    PaymentRequestStatus status,
    Instant createdAt,
    Instant expiresAt,
    Instant paidAt,
    UUID paidByUserId
) {
    public static PaymentRequestDto from(PaymentRequest r) {
        return new PaymentRequestDto(
            r.getId(), r.getKind(), r.getCreatorUserId(), r.getCreatorName(), r.getCreatorPhone(),
            r.getTargetUserId(), r.getTargetPhone(), r.getAmount(), r.getMessage(), r.getStatus(),
            r.getCreatedAt(), r.getExpiresAt(), r.getPaidAt(), r.getPaidByUserId());
    }
}
