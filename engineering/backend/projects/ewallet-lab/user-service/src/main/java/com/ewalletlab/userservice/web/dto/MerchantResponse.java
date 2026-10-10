package com.ewalletlab.userservice.web.dto;

import com.ewalletlab.userservice.domain.Merchant;
import java.time.Instant;
import java.util.UUID;

public record MerchantResponse(
    UUID id,
    UUID userId,
    String merchantName,
    String businessCategory,
    String merchantQrCode,
    Instant createdAt
) {
    public static MerchantResponse from(Merchant merchant) {
        return new MerchantResponse(
            merchant.getId(),
            merchant.getUserId(),
            merchant.getMerchantName(),
            merchant.getBusinessCategory(),
            merchant.getMerchantQrCode(),
            merchant.getCreatedAt()
        );
    }
}
