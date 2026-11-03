package com.ewalletlab.billpaymentservice.web.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpcomingBillsRadarResponseDto(
    List<UpcomingBillItemDto> items,
    BigDecimal totalDueNext7Days,
    BigDecimal totalDueNext30Days,
    BigDecimal currentWalletBalance,
    BigDecimal shortfallNext7Days
) {
}
