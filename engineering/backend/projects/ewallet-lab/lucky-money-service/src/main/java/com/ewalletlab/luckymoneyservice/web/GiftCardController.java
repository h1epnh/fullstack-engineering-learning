package com.ewalletlab.luckymoneyservice.web;

import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import com.ewalletlab.luckymoneyservice.service.GiftCardService;
import com.ewalletlab.luckymoneyservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/gift-cards")
public class GiftCardController {

    private final GiftCardService giftCardService;

    public GiftCardController(GiftCardService giftCardService) {
        this.giftCardService = giftCardService;
    }

    @GetMapping("/templates")
    public List<GiftCardTemplateDto> getTemplates() {
        return giftCardService.getTemplates();
    }

    @PostMapping("/send")
    @ResponseStatus(HttpStatus.CREATED)
    public GiftCardTransferDto send(@Valid @RequestBody SendGiftCardRequestDto request) {
        GiftCardTransfer card = giftCardService.send(request);
        return GiftCardTransferDto.from(card);
    }

    @GetMapping("/received")
    public List<GiftCardTransferDto> getReceived(@RequestParam UUID recipientUserId) {
        return giftCardService.getReceived(recipientUserId).stream()
            .map(GiftCardTransferDto::from)
            .toList();
    }

    @GetMapping("/sent")
    public List<GiftCardTransferDto> getSent(@RequestParam UUID senderId) {
        return giftCardService.getSent(senderId).stream()
            .map(GiftCardTransferDto::from)
            .toList();
    }

    @GetMapping("/{id}")
    public GiftCardTransferDto getById(@PathVariable UUID id) {
        return GiftCardTransferDto.from(giftCardService.get(id));
    }

    @PostMapping("/{id}/open")
    public GiftCardTransferDto open(
            @PathVariable UUID id,
            @RequestBody(required = false) OpenGiftCardRequestDto request) {
        UUID recipientUserId = request != null ? request.recipientUserId() : null;
        GiftCardTransfer card = giftCardService.open(id, recipientUserId);
        return GiftCardTransferDto.from(card);
    }

    @PostMapping("/{id}/reply")
    public GiftCardTransferDto reply(
            @PathVariable UUID id,
            @Valid @RequestBody ReplyGiftCardRequestDto request) {
        GiftCardTransfer card = giftCardService.reply(id, request.recipientUserId(), request.replyMessage());
        return GiftCardTransferDto.from(card);
    }
}
