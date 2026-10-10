package com.ewalletlab.userservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegisterMerchantRequest(
    @NotNull(message = "userId không được để trống")
    UUID userId,

    @NotBlank(message = "Tên cửa hàng không được để trống")
    String merchantName,

    @NotBlank(message = "Ngành nghề kinh doanh không được để trống")
    String businessCategory
) {
}
