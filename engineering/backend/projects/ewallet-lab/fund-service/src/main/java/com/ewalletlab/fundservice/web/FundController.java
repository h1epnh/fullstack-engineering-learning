package com.ewalletlab.fundservice.web;

import com.ewalletlab.fundservice.service.FundService;
import com.ewalletlab.fundservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/funds")
public class FundController {

    private final FundService fundService;

    public FundController(FundService fundService) {
        this.fundService = fundService;
    }

    @PostMapping
    public FundDto create(@Valid @RequestBody CreateFundRequestDto request) {
        return FundDto.from(fundService.create(request.creatorUserId(), request.name(), request.purpose()));
    }

    @GetMapping("/{fundId}")
    public FundDto get(@PathVariable UUID fundId, @RequestParam UUID requesterUserId) {
        return FundDto.from(fundService.get(fundId, requesterUserId));
    }

    @GetMapping
    public List<FundDto> listForMember(@RequestParam UUID memberUserId) {
        return fundService.listForMember(memberUserId).stream().map(FundDto::from).toList();
    }

    @GetMapping("/{fundId}/members")
    public List<FundMemberDto> listMembers(@PathVariable UUID fundId, @RequestParam UUID requesterUserId) {
        return fundService.listMembers(fundId, requesterUserId).stream().map(FundMemberDto::from).toList();
    }

    @PostMapping("/{fundId}/members")
    public FundMemberDto addMember(@PathVariable UUID fundId, @Valid @RequestBody AddFundMemberRequestDto request) {
        return FundMemberDto.from(fundService.addMember(fundId, request.requesterUserId(), request.memberPhone()));
    }

    @GetMapping("/{fundId}/transactions")
    public List<FundTransactionDto> listTransactions(@PathVariable UUID fundId, @RequestParam UUID requesterUserId) {
        return fundService.listTransactions(fundId, requesterUserId).stream().map(FundTransactionDto::from).toList();
    }

    @PostMapping("/{fundId}/contributions")
    public FundDto contribute(@PathVariable UUID fundId, @Valid @RequestBody ContributeRequestDto request) {
        return FundDto.from(fundService.contribute(fundId, request.memberUserId(), request.amount(), request.isStepUpConfirmed()));
    }

    @PostMapping("/{fundId}/withdrawals")
    public FundDto withdraw(@PathVariable UUID fundId, @Valid @RequestBody WithdrawRequestDto request) {
        return FundDto.from(fundService.withdraw(fundId, request.requesterUserId(), request.amount()));
    }

    @PostMapping("/{fundId}/dissolve")
    public FundDto dissolve(@PathVariable UUID fundId, @Valid @RequestBody DissolveRequestDto request) {
        return FundDto.from(fundService.dissolve(fundId, request.requesterUserId()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }

    /** Belt-and-suspenders — FundService's withRetry already turns a sustained optimistic-lock
     * conflict into a clean 409 ResponseStatusException itself via the DataIntegrityViolationException
     * branch, but a genuinely exhausted ObjectOptimisticLockingFailureException (the other branch of
     * that same retry loop) is rethrown as-is on the last attempt — map it here too, same as every
     * other mutation-heavy controller in this project (WalletController, SavingsPocketController). */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleConcurrentModification(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Quỹ nhóm đang được xử lý ở giao dịch khác, vui lòng thử lại");
    }
}
