package com.ewalletlab.paymentrequestservice.web;

import com.ewalletlab.paymentrequestservice.service.PaymentRequestService;
import com.ewalletlab.paymentrequestservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/payment-requests")
public class PaymentRequestController {

    private final PaymentRequestService service;

    public PaymentRequestController(PaymentRequestService service) {
        this.service = service;
    }

    // ---- Issue #3: payment link ----

    @PostMapping("/links")
    public PaymentRequestDto createLink(@Valid @RequestBody CreateLinkRequestDto request) {
        return PaymentRequestDto.from(service.createLink(request));
    }

    /** Payer's confirm screen fetches by token — they don't know the creator by phone number the
     * way today's regular P2P flow works (issue #3's Context). */
    @GetMapping("/links/{token}")
    public PaymentRequestDto getLink(@PathVariable UUID token) {
        return PaymentRequestDto.from(service.getLink(token));
    }

    @PostMapping("/links/{token}/pay")
    public PaymentRequestDto payLink(@PathVariable UUID token, @Valid @RequestBody PayRequestDto request) {
        return PaymentRequestDto.from(service.payLink(token, request.payerUserId()));
    }

    @PostMapping("/links/{token}/cancel")
    public PaymentRequestDto cancelLink(@PathVariable UUID token, @Valid @RequestBody CancelRequestDto request) {
        return PaymentRequestDto.from(service.cancelLink(token, request.creatorUserId()));
    }

    // ---- Issue #8: payment reminder ----

    @PostMapping("/reminders")
    public PaymentRequestDto createReminder(@Valid @RequestBody CreateReminderRequestDto request) {
        return PaymentRequestDto.from(service.createReminder(request));
    }

    @GetMapping("/reminders/sent/{userId}")
    public List<PaymentRequestDto> listSent(@PathVariable UUID userId) {
        return service.listSentReminders(userId).stream().map(PaymentRequestDto::from).toList();
    }

    @GetMapping("/reminders/received/{userId}")
    public List<PaymentRequestDto> listReceived(@PathVariable UUID userId) {
        return service.listReceivedReminders(userId).stream().map(PaymentRequestDto::from).toList();
    }

    @PostMapping("/reminders/{id}/pay")
    public PaymentRequestDto payReminder(@PathVariable UUID id, @Valid @RequestBody PayRequestDto request) {
        return PaymentRequestDto.from(service.payReminder(id, request.payerUserId()));
    }

    /**
     * See issue #5's {@code WalletController.handleConcurrentModification} — same pattern applied
     * here for the same reason (issue #3/#8's race-condition fix): {@code PaymentRequestService}
     * already retries a lost optimistic-lock race a few times before giving up. If it still ends up
     * here, contention on this request is sustained rather than a one-off race — surface it as a
     * retryable 409, not a raw 500.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrentModification(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Yêu cầu đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
