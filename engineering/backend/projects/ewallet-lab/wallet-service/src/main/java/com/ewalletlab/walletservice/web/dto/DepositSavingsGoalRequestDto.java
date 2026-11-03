package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DepositSavingsGoalRequestDto(
    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền nạp tối thiểu là 1.000đ")
    @DecimalMax(value = "200000000", message = "Số tiền nạp tối đa là 200.000.000đ")
    BigDecimal amount,

    boolean stepUpConfirmed
) {}


