package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.AdjustBalanceRequest;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import com.ewalletlab.walletservice.web.dto.StepUpCheckResponse;
import com.ewalletlab.walletservice.web.dto.WalletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    /**
     * Issue #16 — "Quản lý chi tiêu" MVP báo cáo tự động, read-only trên ledger có sẵn (không bảng
     * mới, không service mới). {@code period} bắt buộc, chỉ nhận {@code week}/{@code month} — xem
     * {@link WalletService#spendingReport}'s javadoc cho định nghĩa "chi tiêu" và cách reset kỳ.
     */
    @GetMapping("/{userId}/spending-report")
    public SpendingReportResponse spendingReport(@PathVariable UUID userId, @RequestParam String period) {
        return walletService.spendingReport(userId, period);
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
        Wallet wallet = walletService.debit(userId, request.amount(), request.type(), request.reference(),
            request.note(), request.isStepUpConfirmed());
        return WalletResponse.from(wallet);
    }

    /**
     * Read-only pre-flight for issue #15's step-up rule (see WalletService.stepUpCheck's javadoc for
     * why TOPUP needs this separate GET instead of getting the check "for free" inside debitOnce the
     * way TRANSFER_OUT/BILL_PAYMENT/WITHDRAW do). Internal — called by topup-service before it calls
     * mock-bank-gateway.
     */
    @GetMapping("/{userId}/step-up-check")
    public StepUpCheckResponse stepUpCheck(@PathVariable UUID userId, @RequestParam BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "amount phải > 0");
        }
        return StepUpCheckResponse.from(walletService.stepUpCheck(userId, amount));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleInsufficientBalance(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    /** Issue #15 — see StepUpRequiredException's javadoc for why this is 428, not 409. */
    @ExceptionHandler(StepUpRequiredException.class)
    public ResponseEntity<String> handleStepUpRequired(StepUpRequiredException e) {
        return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(e.getMessage());
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
