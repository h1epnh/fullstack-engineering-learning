package com.ewalletlab.billpaymentservice.web.dto;

import java.util.List;

public record AutoPayRunSummaryDto(
    int totalProcessed,
    int successCount,
    int skippedCount,
    int failedCount,
    List<AutoPayItemResult> details
) {
}

