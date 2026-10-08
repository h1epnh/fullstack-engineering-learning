package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.service.SavingsGoalService;
import com.ewalletlab.walletservice.service.StepUpRequiredException;
import com.ewalletlab.walletservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/savings-goals")
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    public SavingsGoalController(SavingsGoalService savingsGoalService) {
        this.savingsGoalService = savingsGoalService;
    }

    @GetMapping("/disclaimer")
    public Map<String, String> getDisclaimer() {
        return Map.of(
            "title", "Mục tiêu tiết kiệm mô phỏng",
            "disclaimer", "Mục tiêu tiết kiệm mô phỏng cho mục đích học tập — không có ngân hàng thương mại hay tổ chức tín dụng thật đứng sau."
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavingsGoalDto createGoal(@Valid @RequestBody CreateSavingsGoalRequestDto request) {
        return savingsGoalService.createGoal(request);
    }

    @GetMapping
    public List<SavingsGoalDto> getGoals(@RequestParam("userId") UUID userId) {
        return savingsGoalService.getGoals(userId);
    }

    @GetMapping("/{id}")
    public SavingsGoalDetailDto getGoalDetail(@PathVariable("id") UUID id) {
        return savingsGoalService.getGoalDetail(id);
    }

    @PostMapping("/{id}/deposit")
    public SavingsGoalDto deposit(@PathVariable("id") UUID id, @Valid @RequestBody DepositSavingsGoalRequestDto request) {
        return savingsGoalService.deposit(id, request);
    }

    @PostMapping("/{id}/withdraw")
    public SavingsGoalDto withdraw(@PathVariable("id") UUID id, @Valid @RequestBody WithdrawSavingsGoalRequestDto request) {
        return savingsGoalService.withdraw(id, request);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<String> handleNotFound(NoSuchElementException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleOptimisticLock(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Mục tiêu tiết kiệm đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }

    /** Issue #15 — SavingsGoalService.deposit() gọi WalletService.debit() trực tiếp (cùng JVM,
     * không qua HTTP), nên StepUpRequiredException ném ra không tự được WalletController's
     * @ExceptionHandler bắt (handler đó chỉ áp dụng cho request đi vào WalletController) — phải
     * khai báo riêng ở đây, nếu không sẽ rơi về 500 mặc định của Spring thay vì 428 đúng spec. */
    @ExceptionHandler(StepUpRequiredException.class)
    public ResponseEntity<String> handleStepUpRequired(StepUpRequiredException e) {
        return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(e.getMessage());
    }
}

