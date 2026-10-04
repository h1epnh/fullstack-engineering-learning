package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.repository.BankTransferOutRequestRepository;
import com.ewalletlab.topupservice.service.BankTransferOutService;
import com.ewalletlab.topupservice.web.dto.BankTransferOutRequestDto;
import com.ewalletlab.topupservice.web.dto.BankTransferOutResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/bank-transfers")
public class BankTransferOutController {

    private final BankTransferOutService bankTransferOutService;
    private final BankTransferOutRequestRepository repository;

    public BankTransferOutController(BankTransferOutService bankTransferOutService,
                                      BankTransferOutRequestRepository repository) {
        this.bankTransferOutService = bankTransferOutService;
        this.repository = repository;
    }

    /**
     * Returns as soon as the wallet debit succeeds and mock-bank-gateway ACKs — status will be
     * PENDING, not CONFIRMED. Poll GET /bank-transfers/{orderId} to see it settle.
     */
    @PostMapping
    public ResponseEntity<BankTransferOutResponseDto> initiate(@Valid @RequestBody BankTransferOutRequestDto request) {
        BankTransferOutRequest result = bankTransferOutService.initiate(
            request.userId(), request.bankCode(), request.accountNumber(), request.amount(),
            request.isStepUpConfirmed());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(BankTransferOutResponseDto.from(result));
    }

    @GetMapping("/{orderId}")
    public BankTransferOutResponseDto get(@PathVariable String orderId) {
        return repository.findByOrderId(orderId)
            .map(BankTransferOutResponseDto::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bank transfer not found: " + orderId));
    }

    @ExceptionHandler(HttpClientErrorException.Conflict.class)
    public ResponseEntity<String> handleInsufficientBalance(HttpClientErrorException.Conflict e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Số dư không đủ để chuyển khoản");
    }

    /** Issue #15 — see WithdrawalController's identical handler for why this forwards
     * wallet-service's own message instead of re-wording it. */
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<String> handleWalletServiceError(HttpClientErrorException e) {
        if (e.getStatusCode().value() == 428) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(e.getResponseBodyAsString());
        }
        throw e;
    }
}
