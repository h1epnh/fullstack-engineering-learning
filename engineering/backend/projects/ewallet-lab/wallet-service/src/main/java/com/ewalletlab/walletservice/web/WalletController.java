package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.AdjustBalanceRequest;
import com.ewalletlab.walletservice.web.dto.WalletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * "Internal" in the sense that only other services (transfer-service, bill-payment-service) or
 * this lab's own scripts should call /credit and /debit directly — a real system would put these
 * behind mTLS/a service mesh, not a public-facing path. Not enforced here (lab), but the naming
 * and doc comments are deliberate about which endpoints are meant for a browser vs. a peer service.
 */
@RestController
@RequestMapping("/wallets")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/{userId}/balance")
    public WalletResponse getBalance(@PathVariable UUID userId) {
        return WalletResponse.from(walletService.getOrCreateWallet(userId));
    }

    @GetMapping("/{userId}/transactions")
    public List<Transaction> getTransactions(@PathVariable UUID userId) {
        return walletService.history(userId);
    }

    /** Internal — called by transfer-service (credit receiver) and, indirectly via Kafka, topup-service. */
    @PostMapping("/{userId}/credit")
    public WalletResponse credit(@PathVariable UUID userId, @Valid @RequestBody AdjustBalanceRequest request) {
        Wallet wallet = walletService.credit(userId, request.amount(), request.type(), request.reference(), request.note());
        return WalletResponse.from(wallet);
    }

    /** Internal — called by transfer-service (debit sender) and bill-payment-service. */
    @PostMapping("/{userId}/debit")
    public WalletResponse debit(@PathVariable UUID userId, @Valid @RequestBody AdjustBalanceRequest request) {
        Wallet wallet = walletService.debit(userId, request.amount(), request.type(), request.reference(), request.note());
        return WalletResponse.from(wallet);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleInsufficientBalance(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    /**
     * See issue #5: WalletService already retries a lost optimistic-lock race a few times before
     * giving up (WalletService.withOptimisticLockRetry). If it still ends up here, contention on
     * this wallet is sustained rather than a one-off race — surface it as a retryable 409, not a
     * raw 500, so callers (topup-service, transfer-service) can map it the same way they already
     * map insufficient-balance conflicts.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrentModification(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Ví đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
