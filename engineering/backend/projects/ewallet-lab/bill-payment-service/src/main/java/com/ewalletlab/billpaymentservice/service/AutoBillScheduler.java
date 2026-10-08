package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.web.dto.AutoPayRunSummaryDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AutoBillScheduler {

    private static final Logger log = LoggerFactory.getLogger(AutoBillScheduler.class);

    private final BillPaymentService billPaymentService;

    public AutoBillScheduler(BillPaymentService billPaymentService) {
        this.billPaymentService = billPaymentService;
    }

    /**
     * Daily background scheduled run for auto-debit bill mandates due today.
     * Default cron: 4:00 AM daily.
     */
    @Scheduled(cron = "${ewallet-lab.auto-bill.cron:0 0 4 * * ?}")
    public void runDailyAutoBills() {
        log.info("Bắt đầu chạy scheduler thanh toán hoá đơn tự động hàng ngày...");
        AutoPayRunSummaryDto summary = billPaymentService.processAutoBills(false);
        log.info("Scheduler hoàn thành: tổng={}, thành công={}, bỏ qua={}, thất bại={}",
            summary.totalProcessed(), summary.successCount(), summary.skippedCount(), summary.failedCount());
    }
}

