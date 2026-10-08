package com.ewalletlab.investmentfundservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record SellOrderRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "fundId không được để trống")
    UUID fundId,

    @DecimalMin(value = "0.0001", message = "Số lượng chứng chỉ quỹ bán phải lớn hơn 0")
    BigDecimal units,

    Boolean sellAll
) {
}

