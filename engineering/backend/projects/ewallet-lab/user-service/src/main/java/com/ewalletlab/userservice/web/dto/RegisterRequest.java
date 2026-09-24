package com.ewalletlab.userservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
    @NotBlank @Pattern(regexp = "^0\\d{9}$", message = "phải là số điện thoại VN hợp lệ (0 + 9 số)") String phone,
    @NotBlank String name
) {
}
