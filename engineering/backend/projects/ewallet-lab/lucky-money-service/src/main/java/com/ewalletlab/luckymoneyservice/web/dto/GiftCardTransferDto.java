package com.ewalletlab.luckymoneyservice.web.dto;

import com.ewalletlab.luckymoneyservice.domain.GiftCardStatus;
import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record GiftCardTransferDto(
    UUID id,
    UUID senderId,
    String senderName,
    String recipientPhone,
    UUID recipientUserId,
    String recipientName,
    BigDecimal amount,
    String templateCode,
    String customMessage,
    GiftCardStatus status,
    Instant openedAt,
    String replyMessage,
    Instant createdAt
) {
    public static GiftCardTransferDto from(GiftCardTransfer card) {
        return new GiftCardTransferDto(
            card.getId(),
            card.getSenderId(),
            card.getSenderName(),
            card.getRecipientPhone(),
            card.getRecipientUserId(),
            card.getRecipientName(),
            card.getAmount(),
            card.getTemplateCode(),
            card.getCustomMessage(),
            card.getStatus(),
            card.getOpenedAt(),
            card.getReplyMessage(),
            card.getCreatedAt()
        );
    }
}
