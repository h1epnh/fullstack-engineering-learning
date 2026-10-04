package com.ewalletlab.loyaltyservice.web;

import com.ewalletlab.loyaltyservice.service.LoyaltyCalculator;
import com.ewalletlab.loyaltyservice.service.LoyaltyService;
import com.ewalletlab.loyaltyservice.web.dto.LoyaltyDto;
import com.ewalletlab.loyaltyservice.web.dto.RedeemRequestDto;
import jakarta.validation.Valid;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** Issue #19 — same public, userId-in-path convention as every other service in this lab. */
@RestController
@RequestMapping("/loyalty")
public class LoyaltyController {

    private final LoyaltyService service;
    private final LoyaltyCalculator calculator;

    public LoyaltyController(LoyaltyService service, LoyaltyCalculator calculator) {
        this.service = service;
        this.calculator = calculator;
    }

    @GetMapping("/{userId}")
    public LoyaltyDto get(@PathVariable UUID userId) {
        return LoyaltyDto.from(service.get(userId), calculator);
    }

    @PostMapping("/{userId}/redemptions")
    public LoyaltyDto redeem(@PathVariable UUID userId, @Valid @RequestBody RedeemRequestDto request) {
        return LoyaltyDto.from(service.redeem(userId, request.points()), calculator);
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<String> handleLockFailure(PessimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Tài khoản điểm đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
