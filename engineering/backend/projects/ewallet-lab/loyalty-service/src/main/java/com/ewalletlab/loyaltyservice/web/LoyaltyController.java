package com.ewalletlab.loyaltyservice.web;

import com.ewalletlab.loyaltyservice.service.LoyaltyCalculator;
import com.ewalletlab.loyaltyservice.service.LoyaltyService;
import com.ewalletlab.loyaltyservice.web.dto.CheckInResultDto;
import com.ewalletlab.loyaltyservice.web.dto.CheckInStatusDto;
import com.ewalletlab.loyaltyservice.web.dto.ClaimMissionResultDto;
import com.ewalletlab.loyaltyservice.web.dto.LoyaltyDto;
import com.ewalletlab.loyaltyservice.web.dto.MissionDto;
import com.ewalletlab.loyaltyservice.web.dto.RedeemRequestDto;
import com.ewalletlab.loyaltyservice.web.dto.UserIdRequestDto;
import jakarta.validation.Valid;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    /** Issue #38 — "Điểm danh mỗi ngày". 409 (not a raw 500) if already checked in today — handled
     * directly inside {@code LoyaltyService#checkIn} via {@code ResponseStatusException}, same
     * pattern as every other conflict in this service. */
    @PostMapping("/check-in")
    public CheckInResultDto checkIn(@Valid @RequestBody UserIdRequestDto request) {
        return service.checkIn(request.userId());
    }

    @GetMapping("/check-in/status")
    public CheckInStatusDto checkInStatus(@RequestParam UUID userId) {
        return service.checkInStatus(userId);
    }

    /** Issue #38 — "Nhiệm vụ hàng ngày". Lazily upserts today's {@code UserMissionProgress} for
     * every active mission on each call — see {@code LoyaltyService#missions}'s javadoc. */
    @GetMapping("/missions")
    public List<MissionDto> missions(@RequestParam UUID userId) {
        return service.missions(userId);
    }

    @PostMapping("/missions/{missionCode}/claim")
    public ClaimMissionResultDto claimMission(@PathVariable String missionCode, @Valid @RequestBody UserIdRequestDto request) {
        return service.claimMission(request.userId(), missionCode);
    }

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<String> handleLockFailure(PessimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body("Tài khoản điểm đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
