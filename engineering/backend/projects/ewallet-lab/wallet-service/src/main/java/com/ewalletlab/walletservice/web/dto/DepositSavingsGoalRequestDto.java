package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DepositSavingsGoalRequestDto(
    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền nạp tối thiểu là 1.000đ")
    BigDecimal amount,

    boolean stepUpConfirmed
) {}

