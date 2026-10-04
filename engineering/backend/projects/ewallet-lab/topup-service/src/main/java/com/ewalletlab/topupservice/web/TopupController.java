package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import com.ewalletlab.topupservice.service.TopupService;
import com.ewalletlab.topupservice.web.dto.TopupRequestDto;
import com.ewalletlab.topupservice.web.dto.TopupResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/topups")
public class TopupController {

    private final TopupService topupService;
    private final TopupRequestRepository topupRequestRepository;

    public TopupController(TopupService topupService, TopupRequestRepository topupRequestRepository) {
        this.topupService = topupService;
        this.topupRequestRepository = topupRequestRepository;
    }

    /**
     * Returns as soon as mock-bank-gateway ACKs — status will be PENDING here, not SUCCESS. Poll
     * GET /topups/{orderId} (or, in a real app, listen for a push notification) to see it flip to
     * CONFIRMED once the IPN lands.
     */
    @PostMapping
    public ResponseEntity<TopupResponseDto> initiate(@Valid @RequestBody TopupRequestDto request) {
        TopupRequest topupRequest = topupService.initiate(request.userId(), request.amount(), request.isStepUpConfirmed());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(TopupResponseDto.from(topupRequest));
    }

    @GetMapping("/{orderId}")
    public TopupResponseDto get(@PathVariable String orderId) {
        return topupRequestRepository.findByOrderId(orderId)
            .map(TopupResponseDto::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topup not found: " + orderId));
    }

    /**
     * Issue #15 — {@code TopupService.initiate}'s step-up pre-flight throws
     * {@code ResponseStatusException} directly (no upstream {@code HttpClientErrorException} to
     * forward, unlike the other 3 step-up-scoped types which call through to wallet-service's own
     * /debit). Without this handler, Spring's default `/error` JSON body omits the `message` field
     * unless `server.error.include-message` is set — this returns the reason as a plain-text body
     * instead, matching every other handled error in this codebase (see e.g.
     * WithdrawalController/BankTransferOutController), so the frontend's step-up modal can show the
     * exact, sourced Vietnamese copy instead of an empty/generic message.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }
}
