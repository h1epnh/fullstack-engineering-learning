package com.ewalletlab.luckymoneyservice.domain;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Issue #34 — Electronic Gift Cards & Themed Lucky Money (Thiệp mừng điện tử).
 * Unlike lucky money (which uses an escrow pool and requires claiming), gift cards with money
 * transfer funds directly into the recipient's wallet upon sending (via saga), while the recipient
 * receives the card to open and reply with a thank-you note.
 */
@Entity
@Table(name = "gift_card_transfers")
public class GiftCardTransfer {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "sender_name", nullable = false)
    private String senderName;

    @Column(name = "recipient_phone", nullable = false)
    private String recipientPhone;

    @Column(name = "recipient_user_id", nullable = false)
    private UUID recipientUserId;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "template_code", nullable = false)
    private String templateCode;

    @Column(name = "custom_message", length = 255)
    private String customMessage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GiftCardStatus status = GiftCardStatus.SENT;

    @Column(name = "opened_at")
    private Instant openedAt;

    @Column(name = "reply_message", length = 255)
    private String replyMessage;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Version
    private Long version;

    protected GiftCardTransfer() {
        // JPA
    }

    public GiftCardTransfer(
            UUID senderId,
            String senderName,
            UUID recipientUserId,
            String recipientPhone,
            String recipientName,
            BigDecimal amount,
            String templateCode,
            String customMessage) {
        this.senderId = senderId;
        this.senderName = senderName;
        this.recipientUserId = recipientUserId;
        this.recipientPhone = recipientPhone;
        this.recipientName = recipientName;
        this.amount = amount;
        this.templateCode = templateCode;
        this.customMessage = customMessage;
        this.status = GiftCardStatus.SENT;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void markOpened() {
        this.status = GiftCardStatus.OPENED;
        this.openedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void setReplyMessage(String replyMessage) {
        this.replyMessage = replyMessage;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getRecipientPhone() {
        return recipientPhone;
    }

    public UUID getRecipientUserId() {
        return recipientUserId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public String getCustomMessage() {
        return customMessage;
    }

    public GiftCardStatus getStatus() {
        return status;
    }

    public Instant getOpenedAt() {
        return openedAt;
    }

    public String getReplyMessage() {
        return replyMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}
