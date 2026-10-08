package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record RegisterAutoBillRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotNull(message = "category không được để trống")
    BillCategory category,

    @NotBlank(message = "customerCode không được để trống")
    String customerCode,

    @NotNull(message = "maxAmount không được để trống")
    @DecimalMin(value = "1000", message = "Hạn mức tối đa phải từ 1.000đ trở lên")
    BigDecimal maxAmount,

    @NotNull(message = "autoPayDay không được để trống")
    @Min(value = 1, message = "Ngày thanh toán tự động phải từ ngày 1 đến 28")
    @Max(value = 28, message = "Ngày thanh toán tự động phải từ ngày 1 đến 28")
    Integer autoPayDay
) {
}

