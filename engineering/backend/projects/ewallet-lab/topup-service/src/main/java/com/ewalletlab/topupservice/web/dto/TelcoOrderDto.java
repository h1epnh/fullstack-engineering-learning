package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.TelcoOrder;
import com.ewalletlab.topupservice.domain.TelcoOrderStatus;
import com.ewalletlab.topupservice.domain.TelcoOrderType;
import com.ewalletlab.topupservice.domain.TelcoProvider;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TelcoOrderDto(
    UUID id,
    UUID userId,
    String phoneNumber,
    TelcoProvider telcoProvider,
    TelcoOrderType orderType,
    BigDecimal denomination,
    BigDecimal discountRate,
    BigDecimal finalPrice,
    TelcoOrderStatus status,
    String pinCode,
    String serialNumber,
    String failureReason,
    Instant createdAt,
    Instant updatedAt
) {
    public static TelcoOrderDto fromEntity(TelcoOrder order) {
        return new TelcoOrderDto(
            order.getId(),
            order.getUserId(),
            order.getPhoneNumber(),
            order.getTelcoProvider(),
            order.getOrderType(),
            order.getDenomination(),
            order.getDiscountRate(),
            order.getFinalPrice(),
            order.getStatus(),
            order.getPinCode(),
            order.getSerialNumber(),
            order.getFailureReason(),
            order.getCreatedAt(),
            order.getUpdatedAt()
        );
    }
}
