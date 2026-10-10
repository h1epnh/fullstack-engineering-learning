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

    public GiftCardService(
            GiftCardTransferRepository repository,
            UserServiceClient userServiceClient,
            WalletServiceClient walletServiceClient) {
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

        // 1. Debit sender wallet (TRANSFER_OUT)
        try {
            walletServiceClient.debit(
                request.senderId(),
                request.amount(),
                "TRANSFER_OUT",
                recipient.id().toString(),
                "Gửi thiệp mừng " + request.templateCode() + " cho " + recipient.name()
            );
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để gửi thiệp mừng");
        }

        // 2. Credit recipient wallet (TRANSFER_IN)
        try {
            walletServiceClient.credit(
                recipient.id(),
                request.amount(),
                "TRANSFER_IN",
                request.senderId().toString(),
                "Nhận thiệp mừng " + request.templateCode() + " từ " + request.senderName()
            );
        } catch (Exception e) {
            log.error("Failed to credit recipient {} for gift card from sender {}, compensating...",
                recipient.id(), request.senderId(), e);
            try {
                walletServiceClient.credit(
                    request.senderId(),
                    request.amount(),
                    "REFUND",
                    recipient.id().toString(),
                    "Hoàn tiền gửi thiệp mừng do lỗi chuyển khoản"
                );
            } catch (Exception ce) {
                log.error("CRITICAL: Failed to compensate sender {} for gift card!", request.senderId(), ce);
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi chuyển tiền đến người nhận, giao dịch đã được hoàn lại");
        }

        // 3. Save GiftCardTransfer record
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

        return repository.save(card);
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
