package com.ewalletlab.walletservice.web;

import com.ewalletlab.walletservice.domain.SavingsPocket;
import com.ewalletlab.walletservice.service.SavingsPocketNotOpenException;
import com.ewalletlab.walletservice.service.SavingsPocketService;
import com.ewalletlab.walletservice.web.dto.SavingsPocketAmountRequest;
import com.ewalletlab.walletservice.web.dto.SavingsPocketResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Issue #13 — "Túi Thần Tài". Public-facing (the shell/mfe-wallet frontend calls this directly with
 * the logged-in user's own {@code userId}), unlike /credit and /debit on {@link WalletController}
 * which are meant for peer services.
 */
@RestController
@RequestMapping("/wallets/{userId}/savings-pocket")
public class SavingsPocketController {

    private final SavingsPocketService savingsPocketService;

    public SavingsPocketController(SavingsPocketService savingsPocketService) {
        this.savingsPocketService = savingsPocketService;
    }

    @GetMapping
    public SavingsPocketResponse view(@PathVariable UUID userId) {
        try {
            return SavingsPocketResponse.from(savingsPocketService.view(userId));
        } catch (SavingsPocketNotOpenException e) {
            return SavingsPocketResponse.notOpened();
        }
    }

    @PostMapping("/open")
    public SavingsPocketResponse open(@PathVariable UUID userId, @Valid @RequestBody SavingsPocketAmountRequest request) {
        SavingsPocket pocket = savingsPocketService.open(userId, request.amount());
        return SavingsPocketResponse.from(pocket);
    }

    @PostMapping("/deposit")
    public SavingsPocketResponse deposit(@PathVariable UUID userId, @Valid @RequestBody SavingsPocketAmountRequest request) {
        SavingsPocket pocket = savingsPocketService.deposit(userId, request.amount());
        return SavingsPocketResponse.from(pocket);
    }

    @PostMapping("/withdraw")
    public SavingsPocketResponse withdraw(@PathVariable UUID userId, @Valid @RequestBody SavingsPocketAmountRequest request) {
        SavingsPocket pocket = savingsPocketService.withdraw(userId, request.amount());
        return SavingsPocketResponse.from(pocket);
    }

    @ExceptionHandler(SavingsPocketNotOpenException.class)
    public ResponseEntity<String> handleNotOpen(SavingsPocketNotOpenException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrentModification(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Túi Thần Tài đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
