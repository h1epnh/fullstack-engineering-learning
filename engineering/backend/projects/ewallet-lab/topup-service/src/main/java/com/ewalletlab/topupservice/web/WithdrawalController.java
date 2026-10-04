package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.repository.LinkedBankAccountRepository;
import com.ewalletlab.topupservice.service.WalletServiceClient;
import com.ewalletlab.topupservice.web.dto.WithdrawalRequestDto;
import com.ewalletlab.topupservice.web.dto.WithdrawalResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

/**
 * Real wallet-side withdrawal: debits wallet-service synchronously (no simulated bank payout leg
 * the way top-up has mock-bank-gateway — see WalletServiceClient javadoc for why). Requires an
 * already-linked bank account, same real-world precondition MoMo's own withdrawal flow has.
 */
@RestController
public class WithdrawalController {

    private final LinkedBankAccountRepository linkedBankAccountRepository;
    private final WalletServiceClient walletServiceClient;

    public WithdrawalController(LinkedBankAccountRepository linkedBankAccountRepository,
                                 WalletServiceClient walletServiceClient) {
        this.linkedBankAccountRepository = linkedBankAccountRepository;
        this.walletServiceClient = walletServiceClient;
    }

    @PostMapping("/withdrawals")
    public WithdrawalResponseDto withdraw(@Valid @RequestBody WithdrawalRequestDto request) {
        if (linkedBankAccountRepository.findByUserId(request.userId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa liên kết tài khoản ngân hàng");
        }
        WalletServiceClient.DebitResult result = walletServiceClient.debit(
            request.userId(), request.amount(), "Rút tiền qua topup-service", request.isStepUpConfirmed());
        return new WithdrawalResponseDto(result.userId(), result.balance());
    }

    @ExceptionHandler(HttpClientErrorException.Conflict.class)
    public ResponseEntity<String> handleInsufficientBalance(HttpClientErrorException.Conflict e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Số dư không đủ để rút");
    }

    /** Issue #15 — wallet-service surfaces "step-up required" as 428, forward its own message
     * (already the precise, sourced Vietnamese copy) instead of re-wording it here. */
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<String> handleWalletServiceError(HttpClientErrorException e) {
        if (e.getStatusCode().value() == 428) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(e.getResponseBodyAsString());
        }
        throw e;
    }
}
