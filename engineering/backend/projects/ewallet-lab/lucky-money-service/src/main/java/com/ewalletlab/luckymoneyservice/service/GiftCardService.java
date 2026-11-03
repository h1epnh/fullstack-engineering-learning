package com.ewalletlab.luckymoneyservice.service;

import com.ewalletlab.luckymoneyservice.domain.GiftCardStatus;
import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import com.ewalletlab.luckymoneyservice.repository.GiftCardTransferRepository;
import com.ewalletlab.luckymoneyservice.web.dto.GiftCardTemplateDto;
import com.ewalletlab.luckymoneyservice.web.dto.SendGiftCardRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class GiftCardService {

    private static final Logger log = LoggerFactory.getLogger(GiftCardService.class);
    private static final BigDecimal STEP_UP_THRESHOLD = new BigDecimal("10000000");

    private static final List<GiftCardTemplateDto> TEMPLATES = List.of(
        new GiftCardTemplateDto(
            "BIRTHDAY_CHEER",
            "Chúc mừng sinh nhật",
            "Sinh nhật vui vẻ! Thêm tuổi mới nhiều niềm vui, may mắn và hạnh phúc!",
            "amber",
            "cake"
        ),
        new GiftCardTemplateDto(
            "WEDDING_LOVE",
            "Trăm năm hạnh phúc",
            "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, vạn sự như ý!",
            "rose",
            "favorite"
        ),
        new GiftCardTemplateDto(
            "THANK_YOU_WARM",
            "Cảm ơn chân thành",
            "Cảm ơn bạn rất nhiều vì sự giúp đỡ và đồng hành nhiệt tình!",
            "emerald",
            "thumb_up"
        ),
        new GiftCardTemplateDto(
            "CONGRATS_SUCCESS",
            "Chúc mừng thành công",
            "Chúc mừng bạn đã đạt cột mốc mới! Vạn sự hanh thông, công thành danh toại!",
            "indigo",
            "emoji_events"
        )
    );

    private static final Map<String, GiftCardTemplateDto> TEMPLATE_MAP = Map.of(
        "BIRTHDAY_CHEER", TEMPLATES.get(0),
        "WEDDING_LOVE", TEMPLATES.get(1),
        "THANK_YOU_WARM", TEMPLATES.get(2),
        "CONGRATS_SUCCESS", TEMPLATES.get(3)
    );

    private final GiftCardTransferRepository repository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final LuckyMoneyMutationExecutor mutationExecutor;

    public GiftCardService(
            GiftCardTransferRepository repository,
            UserServiceClient userServiceClient,
            WalletServiceClient walletServiceClient,
            LuckyMoneyMutationExecutor mutationExecutor) {
        this.mutationExecutor = mutationExecutor;
        this.repository = repository;
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
    }

    public List<GiftCardTemplateDto> getTemplates() {
        return TEMPLATES;
    }

    public GiftCardTransfer send(SendGiftCardRequestDto request) {
        if (!TEMPLATE_MAP.containsKey(request.templateCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mẫu thiệp không hợp lệ: " + request.templateCode());
        }

        // QĐ 2345/QĐ-NHNN: Transacting > 10M requires step-up confirmation
        if (request.amount().compareTo(STEP_UP_THRESHOLD) > 0 && !Boolean.TRUE.equals(request.stepUpConfirmed())) {
            throw new ResponseStatusException(
                HttpStatus.PRECONDITION_REQUIRED,
                "Giao dịch trên 10 triệu đồng yêu cầu xác thực bổ sung theo QĐ 2345/QĐ-NHNN"
            );
        }

        UserServiceClient.UserResponse recipient;
        try {
            recipient = userServiceClient.findByPhone(request.recipientPhone());
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận với số điện thoại " + request.recipientPhone());
        }

        if (recipient.id().equals(request.senderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể gửi thiệp mừng cho chính mình");
        }

        // 1. Debit sender wallet (TRANSFER_OUT) — SYNCHRONOUS and first (issue #56 / principle 7).
        String debitKey = "giftcard-send:" + UUID.randomUUID();
        try {
            walletServiceClient.debit(
                request.senderId(),
                request.amount(),
                "TRANSFER_OUT",
                recipient.id().toString(),
                "Gửi thiệp mừng " + request.templateCode() + " cho " + recipient.name(),
                debitKey
            );
        } catch (HttpClientErrorException.Conflict e) {
            // wallet 409 = insufficient balance OR monthly limit OR eKYC: pass wallet's message through unless it is the raw English default.
            String conflict = e.getResponseBodyAsString();
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                conflict == null || conflict.isBlank() || conflict.trim().equalsIgnoreCase("Insufficient balance")
                    ? "Số dư không đủ để gửi thiệp mừng" : conflict);
        } catch (HttpServerErrorException.ServiceUnavailable e) {
            // Issue #85: 503 = debit rejected BEFORE execution (eKYC unverifiable, ADR-02): nothing debited,
            // no envelope/card/outbox row, no refund call. Other 5xx / I/O errors are ambiguous: not mapped.
            String body = e.getResponseBodyAsString();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, body != null && !body.isBlank() ? body
                : "Hệ thống chưa thể xác minh định danh hoặc xử lý giao dịch lúc này, vui lòng thử lại sau");
        }

        // 2. Save the card + the recipient-credit OUTBOX row in ONE transaction (issue #56, TD-04).
        GiftCardTransfer card = new GiftCardTransfer(
            request.senderId(),
            request.senderName(),
            recipient.id(),
            recipient.phone(),
            recipient.name(),
            request.amount(),
            request.templateCode(),
            request.customMessage() != null ? request.customMessage().trim() : null
        );
        try {
            return mutationExecutor.saveGiftCardWithOutbox(card,
                "Nhận thiệp mừng " + request.templateCode() + " từ " + request.senderName());
        } catch (RuntimeException e) {
            refundSenderAfterFailedSave(request, debitKey, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Không thể ghi nhận thiệp mừng, giao dịch đã được hoàn lại");
        }
    }

    /** Debit succeeded but card+outbox could not be saved (caught exception): idempotent REFUND to the
     * sender; failing that, ERROR with a reference code (pod death between debit and save is the same
     * accepted trade-off as #60, see DESIGN.md). */
    private void refundSenderAfterFailedSave(SendGiftCardRequestDto request, String debitKey, RuntimeException cause) {
        String ref = "GS-" + UUID.nameUUIDFromBytes(debitKey.getBytes()).toString().substring(0, 8);
        try {
            walletServiceClient.credit(request.senderId(), request.amount(), "REFUND", "giftcard-send-failed",
                "Hoàn tiền gửi thiệp mừng thất bại (mã " + ref + ")", "refund:" + debitKey);
            log.warn("gift card send ref={} sender={} — save failed ({}), sender refunded", ref, request.senderId(),
                cause.toString());
        } catch (RuntimeException refundEx) {
            log.error("GIFTCARD_SEND_MONEY_STUCK ref={} sender={} amount={} debitKey={} — debited, card NOT saved, " +
                "refund FAILED ({}); original: {}. Needs manual reconciliation.", ref, request.senderId(),
                request.amount(), debitKey, refundEx.toString(), cause.toString());
        }

    }

    public List<GiftCardTransfer> getReceived(UUID recipientUserId) {
        return repository.findByRecipientUserIdOrderByCreatedAtDesc(recipientUserId);
    }

    public List<GiftCardTransfer> getSent(UUID senderId) {
        return repository.findBySenderIdOrderByCreatedAtDesc(senderId);
    }

    public GiftCardTransfer get(UUID id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mừng"));
    }

    @Transactional
    public GiftCardTransfer open(UUID id, UUID recipientUserId) {
        GiftCardTransfer card = get(id);
        if (recipientUserId != null && !card.getRecipientUserId().equals(recipientUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người nhận mới có quyền mở thiệp mừng");
        }
        if (card.getStatus() == GiftCardStatus.SENT) {
            card.markOpened();
            return repository.save(card);
        }
        return card;
    }

    @Transactional
    public GiftCardTransfer reply(UUID id, UUID recipientUserId, String replyMessage) {
        GiftCardTransfer card = get(id);
        if (recipientUserId != null && !card.getRecipientUserId().equals(recipientUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ người nhận mới có quyền phản hồi thiệp mừng");
        }
        if (replyMessage == null || replyMessage.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời cảm ơn không được để trống");
        }
        if (replyMessage.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời cảm ơn không được vượt quá 255 ký tự");
        }
        card.setReplyMessage(replyMessage.trim());
        return repository.save(card);
    }
}
