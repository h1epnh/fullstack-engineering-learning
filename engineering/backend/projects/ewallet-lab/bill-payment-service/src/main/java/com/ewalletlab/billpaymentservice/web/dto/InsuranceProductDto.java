package com.ewalletlab.billpaymentservice.web.dto;

import java.math.BigDecimal;

public record InsuranceProductDto(
    String productCode,
    String name,
    String description,
    BigDecimal premiumAmount,
    BigDecimal coverageAmount,
    int durationDays,
    String durationText,
    boolean requiresVehiclePlate
) {
}
