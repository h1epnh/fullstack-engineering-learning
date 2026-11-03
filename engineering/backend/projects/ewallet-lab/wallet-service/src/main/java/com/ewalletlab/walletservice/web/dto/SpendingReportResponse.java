package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Issue #16 & Issue #88 — "Quản lý chi tiêu" PFM 2.0.
 * Hỗ trợ danh mục đời sống, chi tiêu ngoài ví và tương thích ngược với breakdown TransactionType cũ.
 */
public record SpendingReportResponse(
    String period,
    Instant periodStart,
    BigDecimal total,
    Map<TransactionType, BigDecimal> breakdown,
    BigDecimal inWalletTotal,
    BigDecimal externalTotal,
    List<CategoryBreakdownItemDto> categoryBreakdown,
    List<SpendingTransactionItemDto> transactions
) {
    public SpendingReportResponse(String period, Instant periodStart, BigDecimal total,
                                  Map<TransactionType, BigDecimal> breakdown) {
        this(period, periodStart, total, breakdown, total, BigDecimal.ZERO, List.of(), List.of());
    }
}
