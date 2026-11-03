package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateExternalExpenseRequestDto(
    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền phải từ 1.000đ trở lên")
    BigDecimal amount,

    String categoryCode,

    @Size(max = 255, message = "Ghi chú tối đa 255 ký tự")
    String note,

    Instant spentAt
) {
}
