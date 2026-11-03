package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateTransactionCategoryRequestDto(
    @NotBlank(message = "Mã danh mục không được để trống")
    String categoryCode
) {
}
