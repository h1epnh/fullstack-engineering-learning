package com.ewalletlab.transferservice.web.dto;

import com.ewalletlab.transferservice.domain.RecurringFrequency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateRecurringTransferRequestDto(
    @NotNull(message = "senderId không được để trống")
    UUID senderId,

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng")
    String recipientPhone,

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền tối thiểu 1.000đ")
    BigDecimal amount,

    String message,

    @NotNull(message = "Tần suất không được để trống (WEEKLY hoặc MONTHLY)")
    RecurringFrequency frequency,

    @NotNull(message = "Ngày thực thi không được để trống")
    @Min(value = 1, message = "Ngày thực thi tối thiểu là 1")
    @Max(value = 28, message = "Ngày thực thi tối đa là 28")
    Integer executionDay,

    @NotNull(message = "Ngày bắt đầu không được để trống")
    LocalDate startDate,

    LocalDate endDate
) {
}
