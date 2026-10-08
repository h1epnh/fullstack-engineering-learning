package com.ewalletlab.loyaltyservice.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RevertVoucherRequestDto(
    @NotNull(message = "userId không được để trống")
    UUID userId
) {}

