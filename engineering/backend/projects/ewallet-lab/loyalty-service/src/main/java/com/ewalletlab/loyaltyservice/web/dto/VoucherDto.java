package com.ewalletlab.loyaltyservice.web.dto;

import com.ewalletlab.loyaltyservice.domain.Voucher;
import com.ewalletlab.loyaltyservice.domain.VoucherStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record VoucherDto(
    UUID id,
    UUID userId,
    UUID passPurchaseId,
    String code,
    String title,
    String description,
    BigDecimal discountAmount,
    BigDecimal minOrderAmount,
    String applicableCategory,
    VoucherStatus status,
    Instant expiresAt,
    Instant usedAt,
    UUID usedBillId,
    Instant createdAt
) {
    public static VoucherDto from(Voucher v) {
        return new VoucherDto(
            v.getId(),
            v.getUserId(),
            v.getPassPurchaseId(),
            v.getCode(),
            v.getTitle(),
            v.getDescription(),
            v.getDiscountAmount(),
            v.getMinOrderAmount(),
            v.getApplicableCategory(),
            v.getStatus(),
            v.getExpiresAt(),
            v.getUsedAt(),
            v.getUsedBillId(),
            v.getCreatedAt()
        );
    }
}

