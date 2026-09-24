package com.ewalletlab.luckymoneyservice.web;

import com.ewalletlab.luckymoneyservice.service.LuckyMoneyService;
import com.ewalletlab.luckymoneyservice.web.dto.ClaimRequestDto;
import com.ewalletlab.luckymoneyservice.web.dto.LuckyMoneyDto;
import com.ewalletlab.luckymoneyservice.web.dto.SendLuckyMoneyRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lucky-money")
public class LuckyMoneyController {

    private final LuckyMoneyService service;

    public LuckyMoneyController(LuckyMoneyService service) {
        this.service = service;
    }

    @PostMapping
    public LuckyMoneyDto send(@Valid @RequestBody SendLuckyMoneyRequestDto request) {
        return LuckyMoneyDto.from(service.send(request));
    }

    @GetMapping("/{id}")
    public LuckyMoneyDto get(@PathVariable UUID id) {
        return LuckyMoneyDto.from(service.get(id));
    }

    @GetMapping("/sent/{userId}")
    public List<LuckyMoneyDto> listSent(@PathVariable UUID userId) {
        return service.listSent(userId).stream().map(LuckyMoneyDto::from).toList();
    }

    @GetMapping("/received/{userId}")
    public List<LuckyMoneyDto> listReceived(@PathVariable UUID userId) {
        return service.listReceived(userId).stream().map(LuckyMoneyDto::from).toList();
    }

    @PostMapping("/{id}/claim")
    public LuckyMoneyDto claim(@PathVariable UUID id, @Valid @RequestBody ClaimRequestDto request) {
        return LuckyMoneyDto.from(service.claim(id, request.toUserId()));
    }

    /**
     * See issue #5's {@code WalletController.handleConcurrentModification} — same pattern applied
     * here for the same reason (issue #10's race-condition fix): {@code LuckyMoneyService} already
     * retries a lost optimistic-lock race a few times before giving up. If it still ends up here,
     * contention on this lucky money is sustained rather than a one-off race — surface it as a
     * retryable 409, not a raw 500.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrentModification(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Lì xì này đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
