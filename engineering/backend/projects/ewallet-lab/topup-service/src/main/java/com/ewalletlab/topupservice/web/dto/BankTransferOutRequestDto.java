package com.ewalletlab.topupservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Max (see issue #6): a bank-transfer-out is money leaving the wallet the same way a withdrawal
 * is, so it shares MoMo's verified real limit "rút ra khỏi MoMo hoặc thanh toán... tối đa
 * 50.000.000đ/ngày" — https://www.momo.vn/hoi-dap/han-muc-giao-dich-moi-ngay. Applied here as a
 * per-transaction cap (adapted, not a true daily aggregate — see DESIGN.md).
 */
public record BankTransferOutRequestDto(
    @NotNull UUID userId,
    @NotBlank String bankCode,
    @NotBlank @Pattern(regexp = "\\d{6,19}", message = "Số tài khoản phải là 6-19 chữ số") String accountNumber,
    @NotNull @DecimalMin("0.01") @DecimalMax("50000000") BigDecimal amount
) {
}
