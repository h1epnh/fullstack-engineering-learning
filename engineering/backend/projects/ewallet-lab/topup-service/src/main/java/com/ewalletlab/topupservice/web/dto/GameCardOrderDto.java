package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import com.ewalletlab.topupservice.domain.GamePublisher;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GameCardOrderDto(
    UUID id,
    UUID userId,
    GamePublisher publisher,
    String publisherName,
    BigDecimal denomination,
    BigDecimal discountRate,
    BigDecimal finalPrice,
    String pinCode,
    String serialNumber,
    String expiryDate,
    Instant createdAt
) {
    public static GameCardOrderDto fromEntity(GameCardOrder entity) {
        String name = switch (entity.getPublisher()) {
            case GARENA -> "Garena";
            case ZING -> "Zing Card";
            case VCOIN -> "Vcoin";
            case GATE -> "Gate";
            case FUNCARD -> "Funcard";
            case APPOTA -> "Appota Card";
            case GOOGLE_PLAY -> "Google Play Gift Code";
        };

        return new GameCardOrderDto(
            entity.getId(),
            entity.getUserId(),
            entity.getPublisher(),
            name,
            entity.getDenomination(),
            entity.getDiscountRate(),
            entity.getFinalPrice(),
            entity.getPinCode(),
            entity.getSerialNumber(),
            entity.getExpiryDate(),
            entity.getCreatedAt()
        );
    }
}
