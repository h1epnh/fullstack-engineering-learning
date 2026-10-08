package com.ewalletlab.loyaltyservice.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ClaimVoucherResultDto(
    UUID voucherId,
    String code,
    String title,
    BigDecimal discountAmount
) {}

