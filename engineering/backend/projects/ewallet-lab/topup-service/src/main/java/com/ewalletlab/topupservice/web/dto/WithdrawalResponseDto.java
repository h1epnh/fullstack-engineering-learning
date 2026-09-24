package com.ewalletlab.topupservice.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record WithdrawalResponseDto(UUID userId, BigDecimal balance) {
}
