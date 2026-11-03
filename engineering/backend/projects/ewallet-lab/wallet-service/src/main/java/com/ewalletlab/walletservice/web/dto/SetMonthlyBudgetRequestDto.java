package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SetMonthlyBudgetRequestDto(
    @NotBlank(message = "Tháng áp dụng không được để trống (vd: 10/2026)")
    String month,

    String categoryCode, // "ALL" or specific category, default "ALL"

    @NotNull(message = "Hạn mức ngân sách không được để trống")
    @DecimalMin(value = "1000", message = "Hạn mức ngân sách phải từ 1.000đ trở lên")
    BigDecimal budgetLimit
) {
}
