package com.ewalletlab.loyaltyservice.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record ClaimVoucherRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    String billCategory,

    @NotNull(message = "billAmount không được để trống")
    BigDecimal billAmount,

    UUID billId
) {}

