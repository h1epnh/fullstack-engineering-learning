package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionDirection;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.service.SpendingService;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.AccountStatementDto;
import com.ewalletlab.walletservice.web.dto.AdjustBalanceRequest;
import com.ewalletlab.walletservice.web.dto.CreateCustomCategoryRequestDto;
import com.ewalletlab.walletservice.web.dto.CreateExternalExpenseRequestDto;
import com.ewalletlab.walletservice.web.dto.ExternalExpenseDto;
import com.ewalletlab.walletservice.web.dto.MonthlyBudgetDto;
import com.ewalletlab.walletservice.web.dto.SetMonthlyBudgetRequestDto;
import com.ewalletlab.walletservice.web.dto.SpendingCategoryDto;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import com.ewalletlab.walletservice.web.dto.StepUpCheckResponse;
import com.ewalletlab.walletservice.web.dto.TransactionPageDto;
import com.ewalletlab.walletservice.web.dto.UpdateTransactionCategoryRequestDto;
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
    private final SpendingService spendingService;

    public WalletController(WalletService walletService) {
        this(walletService, null);
    }

    public WalletController(WalletService walletService, SpendingService spendingService) {
        this.walletService = walletService;
        this.spendingService = spendingService;
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
     * Issue #16 & Issue #88 — "Quản lý chi tiêu" PFM 2.0: Phân loại danh mục tự động, chi tiêu ngoài ví,
     * ngân sách tháng và cảnh báo 80/100%. Tương thích ngược hoàn toàn với format cũ.
     */
    @GetMapping("/{userId}/spending-report")
    public SpendingReportResponse spendingReport(@PathVariable UUID userId, @RequestParam String period) {
        if (spendingService != null) {
            return spendingService.getSpendingReport(userId, period);
        }
        return walletService.spendingReport(userId, period);
    }

    // --- Issue #88: PFM 2.0 Endpoints ---

    @PutMapping("/{userId}/transactions/{txId}/category")
    public ResponseEntity<Void> setTransactionCategory(@PathVariable UUID userId,
                                                       @PathVariable UUID txId,
                                                       @Valid @RequestBody UpdateTransactionCategoryRequestDto request) {
        if (spendingService != null) {
            spendingService.setTransactionCategory(userId, txId, request.categoryCode());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/spending/categories")
    public List<SpendingCategoryDto> getCategories(@PathVariable UUID userId) {
        if (spendingService != null) {
            return spendingService.getAvailableCategories(userId);
        }
        return List.of();
    }

    @PostMapping("/{userId}/spending/categories")
    public SpendingCategoryDto createCategory(@PathVariable UUID userId,
                                              @Valid @RequestBody CreateCustomCategoryRequestDto request) {
        if (spendingService != null) {
            return spendingService.createCustomCategory(userId, request);
        }
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED);
    }

    @PostMapping("/{userId}/spending/external-expenses")
    public ExternalExpenseDto createExternalExpense(@PathVariable UUID userId,
                                                    @Valid @RequestBody CreateExternalExpenseRequestDto request) {
        if (spendingService != null) {
            return spendingService.createExternalExpense(userId, request);
        }
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED);
    }

    @GetMapping("/{userId}/spending/external-expenses")
    public List<ExternalExpenseDto> getExternalExpenses(@PathVariable UUID userId) {
        if (spendingService != null) {
            return spendingService.getExternalExpenses(userId);
        }
        return List.of();
    }

    @DeleteMapping("/{userId}/spending/external-expenses/{id}")
    public ResponseEntity<Void> deleteExternalExpense(@PathVariable UUID userId, @PathVariable UUID id) {
        if (spendingService != null) {
            spendingService.deleteExternalExpense(userId, id);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/spending/budgets")
    public List<MonthlyBudgetDto> getBudgets(@PathVariable UUID userId,
                                            @RequestParam(required = false) String month) {
        if (spendingService != null) {
            return spendingService.getBudgets(userId, month);
        }
        return List.of();
    }

    @PutMapping("/{userId}/spending/budgets")
    public MonthlyBudgetDto setBudget(@PathVariable UUID userId,
                                      @Valid @RequestBody SetMonthlyBudgetRequestDto request) {
        if (spendingService != null) {
            return spendingService.setBudget(userId, request);
        }
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED);
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

    /** Issue #55 — eKYC tier could not be checked: fail-closed 503, debit rejected before any change. */
    @ExceptionHandler(com.ewalletlab.walletservice.service.KycUnavailableException.class)
    public ResponseEntity<String> handleKycUnavailable(com.ewalletlab.walletservice.service.KycUnavailableException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
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
