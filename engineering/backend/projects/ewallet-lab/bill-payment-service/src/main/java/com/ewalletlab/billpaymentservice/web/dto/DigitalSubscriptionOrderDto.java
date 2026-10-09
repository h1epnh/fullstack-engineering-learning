package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.DigitalSubscriptionOrder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DigitalSubscriptionOrderDto(
    UUID id,
    UUID userId,
    String packageCode,
    String packageName,
    BillCategory category,
    BigDecimal price,
    String accountIdentifier,
    String activationCode,
    String status,
    UUID billPaymentId,
    Instant createdAt
) {
    public static DigitalSubscriptionOrderDto fromEntity(DigitalSubscriptionOrder order) {
        return new DigitalSubscriptionOrderDto(
            order.getId(),
            order.getUserId(),
            order.getPackageCode(),
            order.getPackageName(),
            order.getCategory(),
            order.getPrice(),
            order.getAccountIdentifier(),
            order.getActivationCode(),
            order.getStatus(),
            order.getBillPaymentId(),
            order.getCreatedAt()
        );
    }
}
