package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionDirection;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.AccountStatementDto;
import com.ewalletlab.walletservice.web.dto.AdjustBalanceRequest;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import com.ewalletlab.walletservice.web.dto.StepUpCheckResponse;
import com.ewalletlab.walletservice.web.dto.TransactionPageDto;
import com.ewalletlab.walletservice.web.dto.WalletResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
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

    /** Issue #36 — "Bộ lọc lịch sử giao dịch thông minh". {@code type}/{@code direction}/{@code
     * fromDate}/{@code toDate} đều optional, kết hợp AND nếu truyền nhiều hơn 1 — xem {@code
     * WalletService#searchTransactions}'s javadoc. {@code page}/{@code size}/{@code sort} bind tự
     * động vào {@link Pageable} (Spring Boot's {@code SpringDataWebAutoConfiguration}, không cần
     * khai báo thủ công từng param) — mặc định {@code size=20}, sort theo {@code createdAt} giảm
     * dần (giao dịch mới nhất trước, giống {@code getTransactions} ở trên). */
    @GetMapping("/{userId}/transactions/search")
    public TransactionPageDto searchTransactions(@PathVariable UUID userId,
                                                  @RequestParam(required = false) TransactionType type,
                                                  @RequestParam(required = false) TransactionDirection direction,
                                                  @RequestParam(required = false) Instant fromDate,
                                                  @RequestParam(required = false) Instant toDate,
                                                  @PageableDefault(size = 20, sort = "createdAt",
                                                      direction = org.springframework.data.domain.Sort.Direction.DESC)
                                                  Pageable pageable) {
        return walletService.searchTransactions(userId, type, direction, fromDate, toDate, pageable);
    }

    /** Issue #36 — "Xuất sao kê tài chính". {@code month} là {@code yyyy-MM} (vd {@code 2026-09}) —
     * xem {@code WalletService#statement}'s javadoc cho cách tính opening/closing balance. */
    @GetMapping("/{userId}/statement")
    public AccountStatementDto statement(@PathVariable UUID userId, @RequestParam String month) {
        return walletService.statement(userId, month);
    }

    /** Issue #36 — xuất CSV cùng dữ liệu với {@link #statement}, format {@code Content-Type:
     * text/csv} + header cột đúng tên tiếng Việt yêu cầu trong Acceptance criteria (Mã GD, Thời
     * gian, Loại, Số tiền, Số dư sau GD). {@code format=json} (hoặc bỏ trống) trả về cùng {@link
     * AccountStatementDto} như {@link #statement} — giữ đúng Task #2 của ticket ("CSV hoặc JSON"),
     * không bắt caller phải gọi 2 endpoint khác nhau cho 2 format. */
    @GetMapping("/{userId}/statement/export")
    public ResponseEntity<?> exportStatement(@PathVariable UUID userId, @RequestParam String month,
                                              @RequestParam(defaultValue = "csv") String format) {
        if ("json".equalsIgnoreCase(format)) {
            return ResponseEntity.ok(walletService.statement(userId, month));
        }
        if (!"csv".equalsIgnoreCase(format)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "format phải là 'csv' hoặc 'json'");
        }
        String csv = walletService.statementCsv(userId, month);
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("text/csv"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"statement-" + month + ".csv\"")
            .body(csv);
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

    /** Internal — called by transfer-service (credit receiver), indirectly via Kafka by
     * topup-service, and (issue #22) fund-service's outbox relay with an {@code idempotencyKey}. */
    @PostMapping("/{userId}/credit")
    public WalletResponse credit(@PathVariable UUID userId, @Valid @RequestBody AdjustBalanceRequest request) {
        Wallet wallet = walletService.credit(userId, request.amount(), request.type(), request.reference(),
            request.note(), request.idempotencyKey());
        return WalletResponse.from(wallet);
    }

    /** Internal — called by transfer-service (debit sender), bill-payment-service, and (issue #22)
     * fund-service's outbox relay with an {@code idempotencyKey}. */
    @PostMapping("/{userId}/debit")
    public WalletResponse debit(@PathVariable UUID userId, @Valid @RequestBody AdjustBalanceRequest request) {
        Wallet wallet = walletService.debit(userId, request.amount(), request.type(), request.reference(),
            request.note(), request.isStepUpConfirmed(), request.idempotencyKey());
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
