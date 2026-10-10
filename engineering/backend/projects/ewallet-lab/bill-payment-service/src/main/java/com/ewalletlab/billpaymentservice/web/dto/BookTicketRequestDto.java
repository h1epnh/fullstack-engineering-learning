package com.ewalletlab.billpaymentservice.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record BookTicketRequestDto(
    @NotNull UUID userId,
    @NotNull UUID tripId,
    @NotBlank String passengerName,
    @NotBlank String passengerPhone,
    String seatNumber
) {
}
