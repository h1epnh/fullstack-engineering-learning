package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.EnumSet;
import java.util.Set;

/**
 * Issue #15 — mô phỏng khái niệm step-up authentication của QĐ 2345/QĐ-NHNN (18/12/2023, hiệu lực
 * 01/07/2024): 1 giao dịch chuyển tiền/thanh toán/nạp ví điện tử vượt 10.000.000đ, HOẶC tổng các
 * giao dịch đó trong 1 ngày đạt/vượt 20.000.000đ, bắt buộc xác thực sinh trắc học — dưới ngưỡng đó
 * OTP là đủ. Server-side, "xác thực bổ sung" vẫn chỉ là 1 field {@code stepUpConfirmed} trên
 * request — server KHÔNG tự xác minh sinh trắc học gì cả, chỉ tin field này. Issue #41 nâng cấp
 * PHÍA FRONTEND để field đó chỉ được set `true` sau một ceremony WebAuthn/Touch ID thật (khi thiết
 * bị hỗ trợ và user đã đăng ký) — xem {@code packages/ui/src/StepUpModal.tsx}/`webauthn.ts` và
 * backend/frontend DESIGN.md's mục Touch ID cho ranh giới chính xác (KHÔNG so khớp CCCD như QĐ
 * 2345 thật yêu cầu). Trước #41 (và vẫn còn đúng khi Touch ID không khả dụng/chưa đăng ký), đây là
 * mô phỏng thuần UI (xem backend DESIGN.md).
 *
 * <p>Số liệu 10.000.000đ/20.000.000đ đã xác minh trực tiếp (agent-designer, nguồn
 * thitruongtaichinhtiente.vn) — không tự bịa, không làm tròn khác.
 */
@Component
public class StepUpPolicy {

    /**
     * Transaction types in scope. Broader than issue #7's monthly outbound set: QĐ 2345 explicitly
     * covers "nạp tiền vào ví điện tử" too (see backend DESIGN.md), so TOPUP is included alongside
     * the 3 outbound types — one shared daily pool, not 2 separate pools for inbound/outbound.
     */
    static final Set<TransactionType> STEP_UP_TYPES = EnumSet.of(
        TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT, TransactionType.WITHDRAW, TransactionType.TOPUP,
        TransactionType.BNPL_REPAYMENT, TransactionType.INVESTMENT_BUY, TransactionType.SAVINGS_GOAL_DEPOSIT,
        TransactionType.VOUCHER_PASS_PURCHASE);

    /** Debit-path subset of {@link #STEP_UP_TYPES} — TOPUP is a credit, checked separately by
     * topup-service before initiation (see {@link WalletService#stepUpCheck}), not inside debitOnce.
     * Issue #18 — BNPL_REPAYMENT included here. Issue #25 — INVESTMENT_BUY included here: no exemption
     * from QĐ 2345/QĐ-NHNN was found for buying investment fund certificates.
     * Issue #27 — SAVINGS_GOAL_DEPOSIT included here.
     * Issue #28 — VOUCHER_PASS_PURCHASE included here. */
    static final Set<TransactionType> STEP_UP_DEBIT_TYPES =
        EnumSet.of(TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT, TransactionType.WITHDRAW,
            TransactionType.BNPL_REPAYMENT, TransactionType.INVESTMENT_BUY, TransactionType.SAVINGS_GOAL_DEPOSIT,
            TransactionType.VOUCHER_PASS_PURCHASE);

    private final BigDecimal singleTransactionThreshold;
    private final BigDecimal dailyCumulativeThreshold;

    public StepUpPolicy(
        @Value("${ewallet-lab.step-up.single-threshold:10000000}") BigDecimal singleTransactionThreshold,
        @Value("${ewallet-lab.step-up.daily-threshold:20000000}") BigDecimal dailyCumulativeThreshold) {
        this.singleTransactionThreshold = singleTransactionThreshold;
        this.dailyCumulativeThreshold = dailyCumulativeThreshold;
    }

    /** True if this one transaction alone exceeds the single-transaction threshold, OR if adding it
     * to what's already been done today (in {@link #STEP_UP_TYPES}) reaches/exceeds the daily
     * cumulative threshold. */
    public boolean requiresStepUp(BigDecimal dailyTotalSoFar, BigDecimal amount) {
        if (amount.compareTo(singleTransactionThreshold) > 0) {
            return true;
        }
        return dailyTotalSoFar.add(amount).compareTo(dailyCumulativeThreshold) >= 0;
    }

    public BigDecimal singleTransactionThreshold() {
        return singleTransactionThreshold;
    }

    public BigDecimal dailyCumulativeThreshold() {
        return dailyCumulativeThreshold;
    }

    public String describeRequirement() {
        // Issue #41: không còn khẳng định tuyệt đối "lab này không có sinh trắc học thật" — kể từ
        // #41, nếu thiết bị hỗ trợ và user đã đăng ký, StepUpModal dùng Touch ID/WebAuthn thật để
        // tạo ra chính field stepUpConfirmed này (xem class comment). Message giữ trung lập, không
        // tự nhận biết phía server việc xác nhận có đến từ Touch ID thật hay nút mô phỏng.
        return ("Giao dịch trên %s/lần hoặc tổng giao dịch chuyển tiền/thanh toán/nạp ví trong ngày "
            + "đạt %s cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN")
            .formatted(formatVnd(singleTransactionThreshold), formatVnd(dailyCumulativeThreshold));
    }

    /**
     * Start of "today" in the server's local timezone — same interpretation issue #7 used for
     * "trong một tháng" (calendar reset, not a rolling window), applied here to the day boundary so
     * the 2 reset rules in this codebase are consistent with each other, not 2 different kinds of
     * "reset" a reader has to keep straight.
     */
    static Instant currentDayStart() {
        return LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }
}
