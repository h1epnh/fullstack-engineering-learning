package com.ewalletlab.fundservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddFundMemberRequestDto(
    @NotNull UUID requesterUserId,
    @NotBlank String memberPhone
) {
}
