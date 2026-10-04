package com.ewalletlab.familywalletservice.web.dto;

import com.ewalletlab.familywalletservice.domain.FamilyLink;

import java.math.BigDecimal;
import java.util.UUID;

/** Consumed by wallet-service's FamilyWalletServiceClient — kept minimal (exactly what the debit
 * path needs) rather than reusing FamilyMemberDto, which also carries spentThisMonth (wallet-service
 * computes its own spend total from its own Transaction ledger; see backend DESIGN.md). */
public record FamilyLimitResponseDto(UUID parentUserId, BigDecimal monthlyLimit) {
    public static FamilyLimitResponseDto from(FamilyLink link) {
        return new FamilyLimitResponseDto(link.getParentUserId(), link.getMonthlyLimit());
    }
}
