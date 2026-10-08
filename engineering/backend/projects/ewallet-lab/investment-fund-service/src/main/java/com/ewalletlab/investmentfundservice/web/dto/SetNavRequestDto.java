package com.ewalletlab.investmentfundservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SetNavRequestDto(
    @NotNull(message = "nav không được để trống")
    @DecimalMin(value = "100", message = "NAV tối thiểu là 100đ")
    BigDecimal nav
) {
}

