package com.ewalletlab.transferservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringTransferScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransferScheduler.class);

    private final RecurringTransferService recurringTransferService;

    public RecurringTransferScheduler(RecurringTransferService recurringTransferService) {
        this.recurringTransferService = recurringTransferService;
    }

    @Scheduled(cron = "${ewallet-lab.recurring-transfer.cron:0 0 7 * * *}")
    public void runScheduledTransfers() {
        log.info("Starting scheduled recurring transfer execution run...");
        try {
            var summary = recurringTransferService.triggerRun();
            log.info("Scheduled recurring transfer run completed: scanned={}, success={}, failed={}, skipped={}",
                summary.scannedCount(), summary.successCount(), summary.failedCount(), summary.skippedCount());
        } catch (Exception e) {
            log.error("Error executing scheduled recurring transfers: {}", e.getMessage(), e);
        }
    }
}
