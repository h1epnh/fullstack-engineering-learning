package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record WithdrawSavingsGoalRequestDto(
    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền rút tối thiểu là 1.000đ")
    BigDecimal amount
) {}

