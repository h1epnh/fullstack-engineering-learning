package com.ewalletlab.transferservice.web.dto;

import com.ewalletlab.transferservice.domain.SavedPayee;

import java.time.Instant;
import java.util.UUID;

public record SavedPayeeDto(
    UUID id,
    UUID userId,
    String payeePhone,
    String payeeName,
    String nickname,
    boolean isFavorite,
    Instant lastTransferredAt,
    Instant createdAt
) {
    public static SavedPayeeDto from(SavedPayee entity) {
        return new SavedPayeeDto(
            entity.getId(),
            entity.getUserId(),
            entity.getPayeePhone(),
            entity.getPayeeName(),
            entity.getNickname(),
            entity.isFavorite(),
            entity.getLastTransferredAt(),
            entity.getCreatedAt()
        );
    }
}
