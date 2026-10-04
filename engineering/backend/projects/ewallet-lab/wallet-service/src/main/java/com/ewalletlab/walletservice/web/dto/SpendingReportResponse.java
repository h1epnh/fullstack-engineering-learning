package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

/**
 * Issue #16 — "Quản lý chi tiêu" MVP. {@code periodStart} is exposed so the frontend doesn't have
 * to re-derive "start of this week/month" itself (and risk disagreeing with the server on timezone/
 * week-start-day) — it's purely informational, the server already applied it when computing
 * {@code total}/{@code breakdown}.
 */
public record SpendingReportResponse(String period, Instant periodStart, BigDecimal total,
                                      Map<TransactionType, BigDecimal> breakdown) {
}
