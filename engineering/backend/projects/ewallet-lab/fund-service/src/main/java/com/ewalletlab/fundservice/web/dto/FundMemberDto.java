package com.ewalletlab.fundservice.web.dto;

import com.ewalletlab.fundservice.domain.FundMember;

import java.time.Instant;
import java.util.UUID;

public record FundMemberDto(
    UUID memberUserId,
    String memberPhone,
    String memberName,
    Instant joinedAt
) {
    public static FundMemberDto from(FundMember member) {
        return new FundMemberDto(member.getMemberUserId(), member.getMemberPhone(), member.getMemberName(),
            member.getJoinedAt());
    }
}
