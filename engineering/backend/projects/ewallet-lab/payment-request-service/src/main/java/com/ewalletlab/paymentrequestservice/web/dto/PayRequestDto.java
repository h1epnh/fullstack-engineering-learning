package com.ewalletlab.paymentrequestservice.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PayRequestDto(@NotNull UUID payerUserId) {
}
