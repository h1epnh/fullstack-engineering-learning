package com.ewalletlab.transferservice.web.dto;

import jakarta.validation.constraints.NotBlank;

public record RecordTransferRequestDto(
    @NotBlank(message = "Số điện thoại không được để trống")
    String payeePhone
) {
}
