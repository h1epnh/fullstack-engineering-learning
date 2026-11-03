package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.LuckyMoney;
import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import com.ewalletlab.luckymoneyservice.domain.LuckyMoneyStatus;
import com.ewalletlab.luckymoneyservice.domain.OutboxEvent;
import com.ewalletlab.luckymoneyservice.domain.OutboxEventType;
import com.ewalletlab.luckymoneyservice.repository.GiftCardTransferRepository;
import com.ewalletlab.luckymoneyservice.repository.LuckyMoneyRepository;
import com.ewalletlab.luckymoneyservice.repository.OutboxEventRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Holds the actual, single-attempt, {@code @Transactional} status-transition logic in a bean
 * separate from {@link LuckyMoneyService} on purpose — same reason wallet-service's
 * {@code WalletMutationExecutor} is split from {@code WalletService} (issue #5): retrying a lost
 * optimistic-lock race needs each attempt to run in a brand-new transaction that re-reads the row
 * (and its {@code @Version}) from scratch, which only works across a proxy boundary.
 *
 * <p><b>Fix for the critical "money created from nothing" bug found by agent-tester on issue
 * #10</b>: the original {@code claim()} read {@code status == PENDING}, called wallet-service's
 * real {@code /credit} (crediting real money to the recipient), and only THEN wrote {@code
 * CLAIMED} — with no lock between the read and the write, all 8 concurrent test requests read
 * {@code PENDING} and all 8 called wallet-service's credit, while the sender had only ever been
 * debited once at send time. {@link #claimPendingOnce} (and {@link #claimExpiryOnce} for the
 * lazy-expiry-refund path) invert the order: they atomically claim the terminal status transition
 * FIRST, protected by optimistic locking, and only the winner of that claim is allowed to call
 * wallet-service at all (see {@code LuckyMoneyService.claim} / {@code checkExpiry}).
 */
@Component
class LuckyMoneyMutationExecutor {

    private final LuckyMoneyRepository repository;
    private final GiftCardTransferRepository giftCardRepository;
    private final OutboxEventRepository outboxRepository;
    private final ObjectMapper objectMapper;

    LuckyMoneyMutationExecutor(LuckyMoneyRepository repository, GiftCardTransferRepository giftCardRepository,
                                OutboxEventRepository outboxRepository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.giftCardRepository = giftCardRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    /** Issue #56 — writes the PENDING outbox row; always called inside the caller's @Transactional. */
    private void enqueue(OutboxEventType type, OutboxPayload payload) {
        try {
            outboxRepository.save(OutboxEvent.pending(type, objectMapper.writeValueAsString(payload)));
        } catch (JsonProcessingException e) {
            // Failing the whole local transaction is far safer than a state change with no follow-up row.
            throw new IllegalStateException("Không thể serialize outbox payload", e);
        }
    }

    @Transactional
    LuckyMoney claimPendingOnce(UUID id, UUID toUserId) {
        LuckyMoney lm = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lì xì này"));
        if (!toUserId.equals(lm.getToUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người được lì xì mới có thể nhận khoản này");
        }
        if (lm.getStatus() != LuckyMoneyStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                lm.getStatus() == LuckyMoneyStatus.CLAIMED
                    ? "Lì xì này đã được nhận rồi"
                    : "Lì xì này đã hết hạn và được hoàn tiền lại người gửi");
        }
        lm.markClaimed();
        LuckyMoney saved = repository.save(lm);
        // Issue #56: the recipient's credit is relayed (same transaction as the CLAIMED status).
        enqueue(OutboxEventType.LUCKY_CLAIM_CREDIT, new OutboxPayload(saved.getId(), toUserId, saved.getAmount(),
            "TRANSFER_IN", saved.getFromUserId().toString(), "Nhận lì xì từ " + saved.getFromName(), null));
        return saved;
    }

    /**
     * Atomically claims the "this PENDING lucky money is past its TTL" transition before any
     * refund money moves — same money-creation bug shape as {@link #claimPendingOnce}, applied to
     * the lazy-expiry-refund path (issue #10's "Điểm rẽ #2" lazy-check decision). Returns {@code
     * null} if there was nothing to claim: either a concurrent caller already resolved this row
     * (claimed it, or already refunded it) by the time this transaction re-read it, or it's no
     * longer actually PENDING/expired.
     */
    @Transactional
    LuckyMoney claimExpiryOnce(UUID id) {
        LuckyMoney lm = repository.findById(id).orElse(null);
        if (lm == null || lm.getStatus() != LuckyMoneyStatus.PENDING || !Instant.now().isAfter(lm.getExpiresAt())) {
            return null;
        }
        lm.markExpiredRefunded();
        LuckyMoney saved = repository.save(lm);
        // Issue #56: the sender's REFUND is relayed (same transaction as the EXPIRED_REFUNDED status).
        enqueue(OutboxEventType.LUCKY_EXPIRE_REFUND, new OutboxPayload(saved.getId(), saved.getFromUserId(),
            saved.getAmount(), "REFUND", saved.getToUserId().toString(),
            "Hoàn tiền lì xì hết hạn (48h) chưa được nhận", null));
        return saved;
    }

    /** Compensates a claim/expiry whose follow-up wallet-service call failed afterwards — reverts
     * back to PENDING so a later read/claim can retry it. Only the winner of the claim ever calls
     * this for a given row, so there's no concurrent writer to race against here. */
    @Transactional
    void revertToPending(UUID id) {
        repository.findById(id).ifPresent(lm -> {
            lm.revertToPending();
            repository.save(lm);
        });
    }

    /** Issue #56 — gift card: the sender was already debited synchronously; saves the card and the
     * recipient-credit outbox row in ONE transaction. */
    @Transactional
    GiftCardTransfer saveGiftCardWithOutbox(GiftCardTransfer card, String note) {
        GiftCardTransfer saved = giftCardRepository.save(card);
        enqueue(OutboxEventType.GIFT_CARD_CREDIT_RECIPIENT, new OutboxPayload(saved.getId(),
            saved.getRecipientUserId(), saved.getAmount(), "TRANSFER_IN", saved.getSenderId().toString(), note,
            saved.getSenderId()));
        return saved;
    }

    /** Issue #56 — recipient credit permanently failed: delete the phantom card and enqueue the
     * sender's REFUND, atomically (replaces the old inline "CRITICAL: failed to compensate" log). */
    @Transactional
    void compensateGiftCard(UUID cardId, UUID senderId, UUID recipientId, BigDecimal amount) {
        giftCardRepository.findById(cardId).ifPresent(giftCardRepository::delete);
        enqueue(OutboxEventType.GIFT_CARD_REFUND_SENDER, new OutboxPayload(cardId, senderId, amount, "REFUND",
            recipientId.toString(), "Hoàn tiền gửi thiệp mừng do lỗi chuyển khoản", senderId));
    }
}
