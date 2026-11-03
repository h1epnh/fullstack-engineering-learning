package com.ewalletlab.walletservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCustomCategoryRequestDto(
    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 32, message = "Mã danh mục tối đa 32 ký tự")
    String code,

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 64, message = "Tên danh mục tối đa 64 ký tự")
    String name,

    String icon,
    String color
) {
}
