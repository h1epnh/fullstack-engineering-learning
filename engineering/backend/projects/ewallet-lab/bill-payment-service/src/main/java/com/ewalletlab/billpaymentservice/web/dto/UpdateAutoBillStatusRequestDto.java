package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAutoBillStatusRequestDto(
    @NotNull(message = "status không được để trống")
    AutoBillStatus status
) {
}

