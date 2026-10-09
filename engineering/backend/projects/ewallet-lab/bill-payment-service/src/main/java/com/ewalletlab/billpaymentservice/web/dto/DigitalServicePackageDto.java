package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BillCategory;

import java.math.BigDecimal;

public record DigitalServicePackageDto(
    String packageCode,
    String packageName,
    String serviceName,
    BillCategory category,
    BigDecimal price,
    String duration,
    String description
) {
}
