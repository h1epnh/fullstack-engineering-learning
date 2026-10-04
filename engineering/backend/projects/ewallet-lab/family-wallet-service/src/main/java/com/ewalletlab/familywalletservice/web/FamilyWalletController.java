package com.ewalletlab.familywalletservice.web;

import com.ewalletlab.familywalletservice.service.FamilyWalletService;
import com.ewalletlab.familywalletservice.service.WalletServiceClient;
import com.ewalletlab.familywalletservice.web.dto.AddMemberRequestDto;
import com.ewalletlab.familywalletservice.web.dto.FamilyLimitResponseDto;
import com.ewalletlab.familywalletservice.web.dto.FamilyMemberDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/family-wallets")
public class FamilyWalletController {

    private final FamilyWalletService familyWalletService;

    public FamilyWalletController(FamilyWalletService familyWalletService) {
        this.familyWalletService = familyWalletService;
    }

    /** Add a new member, or update an existing member's limit (upsert — see
     * FamilyWalletService.addOrUpdateMember's javadoc). */
    @PostMapping("/members")
    public FamilyMemberDto addMember(@Valid @RequestBody AddMemberRequestDto request) {
        var link = familyWalletService.addOrUpdateMember(request.parentUserId(), request.memberPhone(), request.monthlyLimit());
        return FamilyMemberDto.from(familyWalletService.toView(link));
    }

    @GetMapping("/members")
    public List<FamilyMemberDto> listMembers(@RequestParam UUID parentUserId) {
        return familyWalletService.listMembers(parentUserId).stream().map(FamilyMemberDto::from).toList();
    }

    /**
     * Internal — called by wallet-service's FamilyWalletServiceClient before a member's outbound
     * debit (TRANSFER_OUT/BILL_PAYMENT/WITHDRAW). 404 means "not a linked family member" — the
     * normal case for the vast majority of users, not an error condition.
     */
    @GetMapping("/members/{memberUserId}/limit")
    public FamilyLimitResponseDto limit(@PathVariable UUID memberUserId) {
        return familyWalletService.limitFor(memberUserId)
            .map(FamilyLimitResponseDto::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không phải thành viên Ví Gia Đình nào"));
    }

    /** Parent's "xem lịch sử chi tiêu" view — see FamilyWalletService.memberHistory's javadoc for
     * the 403 ownership check. */
    @GetMapping("/members/{memberUserId}/history")
    public List<WalletServiceClient.TransactionView> history(@PathVariable UUID memberUserId, @RequestParam UUID parentUserId) {
        return familyWalletService.memberHistory(parentUserId, memberUserId);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }
}
