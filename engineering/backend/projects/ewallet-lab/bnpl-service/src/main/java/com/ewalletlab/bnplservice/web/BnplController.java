package com.ewalletlab.bnplservice.web;

import com.ewalletlab.bnplservice.service.BnplService;
import com.ewalletlab.bnplservice.web.dto.BnplWalletDto;
import com.ewalletlab.bnplservice.web.dto.DrawRequestDto;
import com.ewalletlab.bnplservice.web.dto.OpenRequestDto;
import com.ewalletlab.bnplservice.web.dto.RepayRequestDto;
import jakarta.validation.Valid;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** Issue #18 — "Ví Trả Sau" (mock BNPL). Same public, userId-in-path convention as every other
 * service in this lab (no auth middleware). */
@RestController
@RequestMapping("/bnpl")
public class BnplController {

    private final BnplService service;

    public BnplController(BnplService service) {
        this.service = service;
    }

    /** 200 with {@code opened=false} (not 404) when the user hasn't opened one yet — the UI shows the
     * "chưa mở" screen from it. */
    @GetMapping("/{userId}")
    public BnplWalletDto get(@PathVariable UUID userId) {
        return service.get(userId).map(BnplWalletDto::from).orElseGet(BnplWalletDto::notOpened);
    }

    @PostMapping("/{userId}/open")
    public BnplWalletDto open(@PathVariable UUID userId, @RequestBody OpenRequestDto request) {
        return BnplWalletDto.from(service.open(userId, request.acceptedDisclaimer()));
    }

    @PostMapping("/{userId}/draws")
    public BnplWalletDto draw(@PathVariable UUID userId, @Valid @RequestBody DrawRequestDto request) {
        return BnplWalletDto.from(service.draw(userId, request.amount(), request.label()));
    }

    @PostMapping("/{userId}/repayments")
    public BnplWalletDto repay(@PathVariable UUID userId, @Valid @RequestBody RepayRequestDto request) {
        return BnplWalletDto.from(service.repay(userId, request.amount(), request.isStepUpConfirmed()));
    }

    /** Lock wait timeout / deadlock on the credit-line row — retryable, not a raw 500. */
    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<String> handleLockFailure(PessimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Ví Trả Sau đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
