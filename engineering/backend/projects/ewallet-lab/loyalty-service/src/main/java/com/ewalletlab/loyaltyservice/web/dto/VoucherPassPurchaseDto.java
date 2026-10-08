package com.ewalletlab.loyaltyservice.web.dto;

import com.ewalletlab.loyaltyservice.domain.PassPurchaseStatus;
import com.ewalletlab.loyaltyservice.domain.VoucherPassPurchase;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record VoucherPassPurchaseDto(
    UUID id,
    UUID userId,
    String passCode,
    String passName,
    BigDecimal price,
    PassPurchaseStatus status,
    Instant expiresAt,
    Instant createdAt,
    List<VoucherDto> vouchers
) {
    public static VoucherPassPurchaseDto from(VoucherPassPurchase p, List<VoucherDto> vouchers) {
        return new VoucherPassPurchaseDto(
            p.getId(),
            p.getUserId(),
            p.getPassCode(),
            p.getPassName(),
            p.getPrice(),
            p.getStatus(),
            p.getExpiresAt(),
            p.getCreatedAt(),
            vouchers
        );
    }
}

