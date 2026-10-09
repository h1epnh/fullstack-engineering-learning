package com.ewalletlab.billpaymentservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SubscribeDigitalServiceRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotBlank(message = "packageCode không được để trống")
    String packageCode,

    @NotBlank(message = "accountIdentifier không được để trống")
    String accountIdentifier,

    Boolean stepUpConfirmed
) {
    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}
