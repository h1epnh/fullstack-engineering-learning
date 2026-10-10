package com.ewalletlab.billpaymentservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BuyPolicyRequestDto(
    @NotNull UUID userId,
    @NotBlank String productCode,
    @NotBlank String insuredName,
    @NotBlank String insuredIdCard,
    String vehiclePlate
) {
}
