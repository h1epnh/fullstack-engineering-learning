package com.ewalletlab.transferservice.web.dto;

import java.util.List;

public record RecurringRunSummaryDto(
    int scannedCount,
    int successCount,
    int failedCount,
    int skippedCount,
    List<RecurringTransferLogDto> logs
) {
}
