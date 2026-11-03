package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record WithdrawSavingsGoalRequestDto(
    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền rút tối thiểu là 1.000đ")
    @DecimalMax(value = "200000000", message = "Số tiền rút tối đa là 200.000.000đ")
    BigDecimal amount
) {}


