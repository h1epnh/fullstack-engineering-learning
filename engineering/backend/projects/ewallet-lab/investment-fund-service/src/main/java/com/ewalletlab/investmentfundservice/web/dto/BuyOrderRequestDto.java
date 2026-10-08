package com.ewalletlab.investmentfundservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record BuyOrderRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "fundId không được để trống")
    UUID fundId,

    @NotNull(message = "amount không được để trống")
    @DecimalMin(value = "10000", message = "Số tiền đầu tư tối thiểu là 10.000đ")
    @DecimalMax(value = "100000000", message = "Số tiền đầu tư tối đa mỗi giao dịch là 100.000.000đ")
    BigDecimal amount,

    Boolean stepUpConfirmed,

    Boolean disclaimerAccepted
) {
}

