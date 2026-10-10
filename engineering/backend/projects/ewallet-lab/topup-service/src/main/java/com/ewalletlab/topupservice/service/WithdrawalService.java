package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.MerchantWithdrawalTracker;
import com.ewalletlab.topupservice.domain.Withdrawal;
import com.ewalletlab.topupservice.repository.LinkedBankAccountRepository;
import com.ewalletlab.topupservice.repository.MerchantWithdrawalTrackerRepository;
import com.ewalletlab.topupservice.repository.WithdrawalRepository;
import com.ewalletlab.topupservice.web.dto.WithdrawalRequestDto;
import com.ewalletlab.topupservice.web.dto.WithdrawalResponseDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.UUID;

/**
 * Issue #39: Xử lý rút tiền về ngân hàng cho người dùng & Merchant.
 * Phí rút tiền merchant: miễn phí tới 30.000.000đ/tháng dương lịch, tính phí 0.5% trên phần rút vượt 30tr.
 */
@Service
public class WithdrawalService {

    private static final Logger log = LoggerFactory.getLogger(WithdrawalService.class);

    public static final BigDecimal FREE_WITHDRAWAL_THRESHOLD = new BigDecimal("30000000");
    public static final BigDecimal MERCHANT_FEE_RATE = new BigDecimal("0.005");
    public static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final LinkedBankAccountRepository linkedBankAccountRepository;
    private final WalletServiceClient walletServiceClient;
    private final UserServiceClient userServiceClient;
    private final WithdrawalRepository withdrawalRepository;
    private final MerchantWithdrawalTrackerRepository trackerRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public WithdrawalService(LinkedBankAccountRepository linkedBankAccountRepository,
                             WalletServiceClient walletServiceClient,
                             UserServiceClient userServiceClient,
                             WithdrawalRepository withdrawalRepository,
                             MerchantWithdrawalTrackerRepository trackerRepository) {
        this.linkedBankAccountRepository = linkedBankAccountRepository;
        this.walletServiceClient = walletServiceClient;
        this.userServiceClient = userServiceClient;
        this.withdrawalRepository = withdrawalRepository;
        this.trackerRepository = trackerRepository;
    }

    @Transactional
    public WithdrawalResponseDto processWithdrawal(WithdrawalRequestDto request) {
        if (linkedBankAccountRepository.findByUserId(request.userId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa liên kết tài khoản ngân hàng");
        }

        UUID userId = request.userId();
        BigDecimal amount = request.amount();
        boolean isMerchant = userServiceClient.getMerchantByUserId(userId).isPresent();

        BigDecimal fee = BigDecimal.ZERO;
        MerchantWithdrawalTracker tracker = null;
        BigDecimal newTotal = BigDecimal.ZERO;

        if (isMerchant) {
            String yearMonth = YearMonth.now(VN_ZONE).toString();
            trackerRepository.insertIfAbsent(userId, yearMonth);
            tracker = trackerRepository.findWithLockByUserIdAndYearMonth(userId, yearMonth)
                .orElseThrow(() -> new IllegalStateException("Tracker row missing for user " + userId));

            if (entityManager != null) {
                entityManager.refresh(tracker);
            }

            BigDecimal currentTotal = tracker.getCumulativeWithdrawn();
            newTotal = currentTotal.add(amount);

            if (newTotal.compareTo(FREE_WITHDRAWAL_THRESHOLD) <= 0) {
                fee = BigDecimal.ZERO;
            } else if (currentTotal.compareTo(FREE_WITHDRAWAL_THRESHOLD) < 0) {
                BigDecimal taxable = newTotal.subtract(FREE_WITHDRAWAL_THRESHOLD);
                fee = taxable.multiply(MERCHANT_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
            } else {
                fee = amount.multiply(MERCHANT_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
            }

            // Pre-check balance if fee > 0 to fail fast
            if (fee.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal totalNeeded = amount.add(fee);
                BigDecimal currentBalance = walletServiceClient.getBalance(userId);
                if (currentBalance.compareTo(totalNeeded) < 0) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Số dư không đủ để rút tiền và thanh toán phí vượt hạn mức (phí: " + fee + "đ)");
                }
            }
        }

        // 1. Debit wallet-service for amount
        WalletServiceClient.DebitResult debitResult = walletServiceClient.debit(
            userId, amount, "WITHDRAW", "Rút tiền qua topup-service", request.isStepUpConfirmed());

        BigDecimal finalBalance = debitResult.balance();

        // 2. If fee > 0, debit fee as a separate transaction in wallet-service
        if (fee.compareTo(BigDecimal.ZERO) > 0) {
            try {
                WalletServiceClient.DebitResult feeResult = walletServiceClient.debit(
                    userId, fee, "WITHDRAW", "Phí rút tiền merchant vượt hạn mức 30tr/tháng (0,5%)", true);
                finalBalance = feeResult.balance();
            } catch (Exception ex) {
                log.error("Failed to debit fee {} for user {}, compensating withdrawal of {}", fee, userId, amount, ex);
                try {
                    walletServiceClient.credit(userId, amount, "REFUND", "Hoàn tiền rút do lỗi trừ phí giao dịch");
                } catch (Exception refundEx) {
                    log.error("Critical: failed to refund withdrawal amount {} to user {}", amount, userId, refundEx);
                }
                throw ex;
            }
        }

        // 3. Update tracker and record withdrawal
        if (tracker != null) {
            tracker.setCumulativeWithdrawn(newTotal);
            trackerRepository.saveAndFlush(tracker);
        }

        Withdrawal withdrawal = new Withdrawal(userId, amount, fee, "SUCCESS");
        withdrawalRepository.save(withdrawal);

        return new WithdrawalResponseDto(userId, finalBalance, fee);
    }
}
