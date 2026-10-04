package com.ewalletlab.familywalletservice.web.dto;

import com.ewalletlab.familywalletservice.service.FamilyWalletService;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FamilyMemberDto(
    UUID memberUserId,
    String memberPhone,
    String memberName,
    BigDecimal monthlyLimit,
    BigDecimal spentThisMonth,
    Instant createdAt
) {
    public static FamilyMemberDto from(FamilyWalletService.MemberView view) {
        return new FamilyMemberDto(
            view.link().getMemberUserId(),
            view.link().getMemberPhone(),
            view.link().getMemberName(),
            view.link().getMonthlyLimit(),
            view.spentThisMonth(),
            view.link().getCreatedAt()
        );
    }
}
