package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateSavingsGoalRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotBlank(message = "Tên mục tiêu không được để trống")
    String name,

    @NotNull(message = "Số tiền mục tiêu không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền mục tiêu tối thiểu là 1.000đ")
    BigDecimal targetAmount,

    @NotNull(message = "Ngày kết thúc không được để trống")
    @FutureOrPresent(message = "Ngày kết thúc không được ở quá khứ")
    LocalDate targetDate,

    @DecimalMin(value = "0", message = "Số tiền nạp ban đầu không được âm")
    BigDecimal initialDepositAmount,

    boolean stepUpConfirmed
) {}

