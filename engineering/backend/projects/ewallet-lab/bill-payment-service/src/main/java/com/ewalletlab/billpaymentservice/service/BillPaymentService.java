package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.domain.BillPaymentStatus;
import com.ewalletlab.billpaymentservice.domain.PaymentSource;
import com.ewalletlab.billpaymentservice.repository.AutoBillRegistrationRepository;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.web.dto.AutoBillRegistrationDto;
import com.ewalletlab.billpaymentservice.web.dto.AutoPayItemResult;
import com.ewalletlab.billpaymentservice.web.dto.AutoPayRunSummaryDto;
import com.ewalletlab.billpaymentservice.web.dto.BillLookupResponse;
import com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.BillPaymentReceiptDto;
import com.ewalletlab.billpaymentservice.web.dto.RegisterAutoBillRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import com.ewalletlab.billpaymentservice.domain.DigitalSubscriptionOrder;
import com.ewalletlab.billpaymentservice.repository.DigitalSubscriptionRepository;
import com.ewalletlab.billpaymentservice.web.dto.UpcomingBillItemDto;
import com.ewalletlab.billpaymentservice.web.dto.UpcomingBillsRadarResponseDto;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.UUID;

/**
 * Mock biller lookup + pay and Auto-debit Mandates (issue #26).
 */
@Service
public class BillPaymentService {

    private static final Logger log = LoggerFactory.getLogger(BillPaymentService.class);
    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final BigDecimal STEP_UP_THRESHOLD = new BigDecimal("10000000");

    private final BillPaymentRepository billPaymentRepository;
    private final AutoBillRegistrationRepository autoBillRegistrationRepository;
    private final WalletServiceClient walletServiceClient;
    private final LoyaltyServiceClient loyaltyServiceClient;
    private final BnplServiceClient bnplServiceClient;
    private final DigitalSubscriptionRepository digitalSubscriptionRepository;

    public BillPaymentService(BillPaymentRepository billPaymentRepository,
                              AutoBillRegistrationRepository autoBillRegistrationRepository,
                              WalletServiceClient walletServiceClient,
                              LoyaltyServiceClient loyaltyServiceClient,
                              BnplServiceClient bnplServiceClient) {
        this(billPaymentRepository, autoBillRegistrationRepository, walletServiceClient, loyaltyServiceClient, bnplServiceClient, null);
    }

    public BillPaymentService(BillPaymentRepository billPaymentRepository,
                              AutoBillRegistrationRepository autoBillRegistrationRepository,
                              WalletServiceClient walletServiceClient,
                              LoyaltyServiceClient loyaltyServiceClient,
                              BnplServiceClient bnplServiceClient,
                              DigitalSubscriptionRepository digitalSubscriptionRepository) {
        this.billPaymentRepository = billPaymentRepository;
        this.autoBillRegistrationRepository = autoBillRegistrationRepository;
        this.walletServiceClient = walletServiceClient;
        this.loyaltyServiceClient = loyaltyServiceClient;
        this.bnplServiceClient = bnplServiceClient;
        this.digitalSubscriptionRepository = digitalSubscriptionRepository;
    }

    public BillLookupResponse lookup(BillCategory category, String customerCode) {
        String period = LocalDate.now().format(PERIOD_FORMAT);
        if (billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(category, customerCode, period)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Hoá đơn kỳ " + period + " của mã khách hàng này đã được thanh toán");
        }
        BigDecimal amount = mockDueAmount(category, customerCode);
        String customerName = mockCustomerName(customerCode);
        return new BillLookupResponse(category, customerCode, customerName, amount, "Kỳ " + period);
    }

    public BillPaymentReceiptDto pay(BillPayRequestDto request) {
        String period = LocalDate.now().format(PERIOD_FORMAT);
        if (billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(request.category(), request.customerCode(), period)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Hoá đơn kỳ " + period + " của mã khách hàng này đã được thanh toán");
        }

        BigDecimal originalAmount = mockDueAmount(request.category(), request.customerCode());

        // Claim-First (Issue #125): Claim bản ghi DB trước với trạng thái PENDING và saveAndFlush()
        // để khóa duy nhất uk_bill_payments_category_customer_period chặn đứng luồng đua (race condition)
        // mà hoàn toàn CHƯA gọi debit ví, không làm lẹm 1 đồng hạn mức tháng 100M (#7) hay ngày 20M (#15).
        BillPayment pendingPayment;
        try {
            BillPayment bill = new BillPayment(
                request.userId(), request.category(), request.customerCode(), originalAmount, period,
                BigDecimal.ZERO, request.voucherId(), originalAmount, request.getPaymentSource()
            );
            bill.setStatus(BillPaymentStatus.PENDING);
            pendingPayment = billPaymentRepository.saveAndFlush(bill);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Hoá đơn kỳ " + period + " của mã khách hàng này đang được xử lý hoặc đã được thanh toán", e);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalAmount = originalAmount;

        // 1. Áp dụng voucher nếu có
        if (request.voucherId() != null) {
            try {
                LoyaltyServiceClient.ClaimResult claim = loyaltyServiceClient.claimVoucher(
                    request.voucherId(), request.userId(), request.category().name(), originalAmount, null
                );
                if (claim != null && claim.discountAmount() != null) {
                    discountAmount = claim.discountAmount().min(originalAmount);
                    finalAmount = originalAmount.subtract(discountAmount);
                }
            } catch (HttpClientErrorException e) {
                cleanupPendingPayment(pendingPayment);
                int status = e.getStatusCode().value();
                if (status == 409) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher đã được sử dụng hoặc không còn khả dụng");
                } else if (status == 400) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getResponseBodyAsString());
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể xác thực voucher: " + e.getMessage());
            } catch (Exception e) {
                cleanupPendingPayment(pendingPayment);
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể xác thực voucher: " + e.getMessage());
            }
        }

        // 2. Phân nhánh nguồn tiền thanh toán (Issue #37: MAIN_WALLET vs BNPL_WALLET)
        if (request.getPaymentSource() == PaymentSource.BNPL_WALLET) {
            // Ràng buộc Step-up #15 cho BNPL > 10M
            if (finalAmount.compareTo(STEP_UP_THRESHOLD) > 0 && !request.isStepUpConfirmed()) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                throw new ResponseStatusException(HttpStatus.valueOf(428),
                    "Giao dịch thanh toán hoá đơn trên 10.000.000đ bằng Ví Trả Sau cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN");
            }

            // Kiểm tra trạng thái và hạn mức Ví Trả Sau
            BnplServiceClient.BnplWalletDto bnplWallet;
            try {
                bnplWallet = bnplServiceClient.getWallet(request.userId());
            } catch (Exception e) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không kết nối được dịch vụ Ví Trả Sau: " + e.getMessage());
            }

            if (bnplWallet == null || !bnplWallet.opened()) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn chưa mở Ví Trả Sau. Vui lòng mở Ví Trả Sau trước khi thanh toán.");
            }

            if (bnplWallet.availableLimit() == null || bnplWallet.availableLimit().compareTo(finalAmount) < 0) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Hạn mức khả dụng Ví Trả Sau không đủ (còn " + (bnplWallet.availableLimit() != null ? bnplWallet.availableLimit() : 0) + "đ)");
            }

            String note = "Thanh toán hoá đơn " + describeCategory(request.category())
                + (discountAmount.signum() > 0 ? " (voucher -" + discountAmount + "đ)" : " (mock biller)");

            BnplServiceClient.BnplWalletDto drawResult;
            try {
                drawResult = bnplServiceClient.draw(request.userId(), finalAmount, note);
            } catch (HttpClientErrorException e) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                int status = e.getStatusCode().value();
                if (status == 409) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Hạn mức khả dụng Ví Trả Sau không đủ để thanh toán");
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi trích xuất hạn mức Ví Trả Sau: " + e.getMessage());
            } catch (Exception e) {
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không gọi được Ví Trả Sau: " + e.getMessage());
            }

            pendingPayment.setStatus(BillPaymentStatus.PAID);
            pendingPayment.setDiscountAmount(discountAmount);
            pendingPayment.setFinalAmount(finalAmount);
            pendingPayment.setPaymentSource(PaymentSource.BNPL_WALLET);
            BillPayment saved;
            try {
                saved = billPaymentRepository.save(pendingPayment);
            } catch (Exception e) {
                try {
                    bnplServiceClient.refund(request.userId(), finalAmount, "Hoàn trả hạn mức do lỗi lưu biên lai hoá đơn");
                } catch (Exception refundEx) {
                    log.error("Lỗi khi bồi hoàn hạn mức Ví Trả Sau cho user {}: {}", request.userId(), refundEx.getMessage());
                }
                cleanupPendingPayment(pendingPayment);
                if (request.voucherId() != null) {
                    try {
                        loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                    } catch (Exception revertEx) {
                        log.error("Lỗi khi revert voucher cho user {}: {}", request.userId(), revertEx.getMessage());
                    }
                }
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lưu hoá đơn, đã hoàn lại hạn mức Ví Trả Sau", e);
            }

            BigDecimal remainingLimit = drawResult != null && drawResult.availableLimit() != null ? drawResult.availableLimit() : BigDecimal.ZERO;
            return new BillPaymentReceiptDto(
                saved.getId(), saved.getUserId(), saved.getCategory(), saved.getCustomerCode(),
                saved.getAmount(), remainingLimit, saved.getCreatedAt(),
                discountAmount, request.voucherId(), finalAmount, PaymentSource.BNPL_WALLET);
        }

        // 3. Trừ tiền ví chính với finalAmount (Nguồn tiền MAIN_WALLET)
        WalletServiceClient.DebitResult debitResult;
        try {
            String note = "Thanh toán hoá đơn " + describeCategory(request.category())
                + (discountAmount.signum() > 0 ? " (voucher -" + discountAmount + "đ)" : " (mock biller)");

            debitResult = walletServiceClient.debit(
                request.userId(), finalAmount,
                request.category() + ":" + request.customerCode(),
                note,
                request.isStepUpConfirmed());
        } catch (HttpClientErrorException e) {
            cleanupPendingPayment(pendingPayment);
            if (request.voucherId() != null) {
                loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
            }
            int status = e.getStatusCode().value();
            if (status == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), "Giao dịch cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN");
            } else if (status == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    WalletErrors.conflictMessage(e, "Số dư không đủ để thanh toán hoá đơn"));
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trích nợ ví: " + e.getMessage());
        } catch (HttpServerErrorException.ServiceUnavailable e) {
            cleanupPendingPayment(pendingPayment);
            if (request.voucherId() != null) {
                loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
            }
            throw WalletErrors.unavailable(e);
        } catch (Exception e) {
            cleanupPendingPayment(pendingPayment);
            if (request.voucherId() != null) {
                loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
            }
            throw e;
        }

        pendingPayment.setStatus(BillPaymentStatus.PAID);
        pendingPayment.setDiscountAmount(discountAmount);
        pendingPayment.setFinalAmount(finalAmount);
        pendingPayment.setPaymentSource(PaymentSource.MAIN_WALLET);
        BillPayment saved;
        try {
            saved = billPaymentRepository.save(pendingPayment);
        } catch (Exception e) {
            try {
                walletServiceClient.credit(
                    request.userId(),
                    finalAmount,
                    "REFUND",
                    request.category() + ":" + request.customerCode(),
                    "Hoàn tiền do lỗi lưu biên lai hoá đơn: " + e.getMessage()
                );
            } catch (Exception creditEx) {
                log.error("Lỗi khi bồi hoàn ví chính cho user {}: {}", request.userId(), creditEx.getMessage());
            }
            cleanupPendingPayment(pendingPayment);
            if (request.voucherId() != null) {
                try {
                    loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
                } catch (Exception revertEx) {
                    log.error("Lỗi khi revert voucher cho user {}: {}", request.userId(), revertEx.getMessage());
                }
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi lưu hoá đơn, đã hoàn lại tiền vào ví chính", e);
        }

        return new BillPaymentReceiptDto(
            saved.getId(), saved.getUserId(), saved.getCategory(), saved.getCustomerCode(),
            saved.getAmount(), debitResult.balance(), saved.getCreatedAt(),
            discountAmount, request.voucherId(), finalAmount, PaymentSource.MAIN_WALLET);
    }

    private void cleanupPendingPayment(BillPayment pendingPayment) {
        if (pendingPayment != null && pendingPayment.getId() != null) {
            try {
                billPaymentRepository.delete(pendingPayment);
                billPaymentRepository.flush();
            } catch (Exception e) {
                log.error("Lỗi khi giải phóng pending bill payment id={}: {}", pendingPayment.getId(), e.getMessage());
            }
        }
    }

    public List<BillPayment> history(UUID userId) {
        return billPaymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- Issue #26: Auto-debit Mandates ---

    public AutoBillRegistrationDto registerAutoBill(RegisterAutoBillRequestDto req) {
        Optional<AutoBillRegistration> existing = autoBillRegistrationRepository
            .findByUserIdAndCategoryAndCustomerCodeAndStatus(req.userId(), req.category(), req.customerCode(), AutoBillStatus.ACTIVE);

        if (existing.isPresent()) {
            AutoBillRegistration reg = existing.get();
            reg.setMaxAmount(req.maxAmount());
            reg.setAutoPayDay(req.autoPayDay());
            if (req.spikeAlertThresholdPercent() != null) {
                reg.setSpikeAlertThresholdPercent(req.spikeAlertThresholdPercent());
            }
            return AutoBillRegistrationDto.from(autoBillRegistrationRepository.save(reg));
        }

        AutoBillRegistration reg = new AutoBillRegistration(
            req.userId(), req.category(), req.customerCode(), req.maxAmount(), req.autoPayDay(), req.spikeAlertThresholdPercent()
        );
        return AutoBillRegistrationDto.from(autoBillRegistrationRepository.save(reg));
    }

    public List<AutoBillRegistrationDto> getAutoBills(UUID userId) {
        return autoBillRegistrationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(AutoBillRegistrationDto::from)
            .toList();
    }

    public AutoBillRegistrationDto updateAutoBillStatus(UUID id, AutoBillStatus newStatus) {
        AutoBillRegistration reg = autoBillRegistrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy uỷ quyền thanh toán"));
        reg.setStatus(newStatus);
        return AutoBillRegistrationDto.from(autoBillRegistrationRepository.save(reg));
    }

    public AutoPayRunSummaryDto processAutoBills(boolean forceAll) {
        List<AutoBillRegistration> candidates = forceAll
            ? autoBillRegistrationRepository.findByStatus(AutoBillStatus.ACTIVE)
            : autoBillRegistrationRepository.findByStatusAndAutoPayDay(AutoBillStatus.ACTIVE, LocalDate.now().getDayOfMonth());

        String period = LocalDate.now().format(PERIOD_FORMAT);
        Instant startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<AutoPayItemResult> details = new ArrayList<>();
        int successCount = 0;
        int skippedCount = 0;
        int failedCount = 0;

        for (AutoBillRegistration reg : candidates) {
            BigDecimal amount = mockDueAmount(reg.getCategory(), reg.getCustomerCode());

            // 1. Idempotency check: already paid this period?
            boolean alreadyPaid = billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(reg.getCategory(), reg.getCustomerCode(), period)
                || billPaymentRepository.existsByCategoryAndCustomerCodeAndCreatedAtGreaterThanEqual(reg.getCategory(), reg.getCustomerCode(), startOfMonth);

            if (alreadyPaid) {
                skippedCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "SKIPPED_ALREADY_PAID",
                    "Hoá đơn kỳ %s đã được thanh toán thành công trước đó".formatted(period)
                ));
                continue;
            }

            // 2. Max cap check: bill.amount > registration.maxAmount
            if (amount.compareTo(reg.getMaxAmount()) > 0) {
                skippedCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "SKIPPED_EXCEEDED_MAX_AMOUNT",
                    "Số tiền hoá đơn %s vượt hạn mức tự động %s đã cài đặt".formatted(amount, reg.getMaxAmount())
                ));
                continue;
            }

            // 3. Step-up auth check (QĐ 2345/QĐ-NHNN): background scheduler cannot prompt for biometrics
            if (amount.compareTo(STEP_UP_THRESHOLD) > 0) {
                skippedCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "SKIPPED_STEP_UP_REQUIRED",
                    "Số tiền hoá đơn vượt ngưỡng 10.000.000đ yêu cầu xác thực bổ sung theo QĐ 2345/QĐ-NHNN, cần thanh toán thủ công"
                ));
                continue;
            }

            // 3.5. Bill Spike Protection (Issue #89):
            // Tra cứu hoá đơn đã thanh toán gần nhất của cùng (userId, category, customerCode)
            List<BillPayment> previousBills = billPaymentRepository
                .findByUserIdAndCategoryAndCustomerCodeOrderByCreatedAtDesc(reg.getUserId(), reg.getCategory(), reg.getCustomerCode());
            Optional<BillPayment> previousPaidBill = previousBills.stream()
                .filter(b -> !period.equals(b.getPeriod()))
                .findFirst();

            if (previousPaidBill.isPresent() && previousPaidBill.get().getAmount().signum() > 0) {
                BigDecimal previousAmount = previousPaidBill.get().getAmount();
                BigDecimal diff = amount.subtract(previousAmount);
                if (diff.signum() > 0) {
                    double changePercent = diff.multiply(BigDecimal.valueOf(100))
                        .divide(previousAmount, 1, RoundingMode.HALF_UP)
                        .doubleValue();
                    double threshold = reg.getSpikeAlertThresholdPercent() != null ? reg.getSpikeAlertThresholdPercent() : 30.0;
                    if (changePercent >= threshold) {
                        reg.setStatus(AutoBillStatus.HELD_FOR_SPIKE_REVIEW);
                        reg.setHeldAmount(amount);
                        reg.setHeldPeriod(period);
                        reg.setHeldPreviousAmount(previousAmount);
                        String heldReason = String.format(Locale.ROOT,
                            "Cảnh báo Hóa đơn tăng bất thường: Hóa đơn %s mã %s kỳ này là %,dđ (tăng +%.1f%% so với kỳ trước %,dđ). Hệ thống đã tạm giữ lệnh thanh toán tự động để chờ bạn xác nhận.",
                            describeCategory(reg.getCategory()), reg.getCustomerCode(), amount.longValue(), changePercent, previousAmount.longValue());
                        reg.setHeldReason(heldReason);
                        autoBillRegistrationRepository.save(reg);
                        log.warn("Tạm giữ hoá đơn do tăng đột biến: {}", heldReason);
                        skippedCount++;
                        details.add(new AutoPayItemResult(
                            reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                            "HELD_FOR_SPIKE_REVIEW", heldReason
                        ));
                        continue;
                    }
                }
            }

            // 4. Execute payment with Concurrency Protection (Claim trước, debit sau)
            BillPayment pendingPayment;
            try {
                BillPayment bill = new BillPayment(reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount, period);
                bill.setStatus(BillPaymentStatus.PENDING);
                pendingPayment = billPaymentRepository.saveAndFlush(bill);
            } catch (DataIntegrityViolationException e) {
                // Đã có request khác vừa claim hoặc thanh toán thành công cho kỳ này
                skippedCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "SKIPPED_ALREADY_PAID",
                    "Hoá đơn kỳ %s đang được xử lý hoặc đã được thanh toán bởi tiến trình khác".formatted(period)
                ));
                continue;
            }

            try {
                walletServiceClient.debit(
                    reg.getUserId(), amount,
                    reg.getCategory() + ":" + reg.getCustomerCode(),
                    "Thanh toán tự động hoá đơn " + describeCategory(reg.getCategory()) + " kỳ " + period,
                    false
                );
                pendingPayment.setStatus(BillPaymentStatus.PAID);
                billPaymentRepository.save(pendingPayment);
                successCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "SUCCESS",
                    "Thanh toán tự động thành công"
                ));
            } catch (HttpClientErrorException e) {
                billPaymentRepository.delete(pendingPayment);
                billPaymentRepository.flush();
                if (e.getStatusCode().value() == 428) {
                    skippedCount++;
                    details.add(new AutoPayItemResult(
                        reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                        "SKIPPED_STEP_UP_REQUIRED",
                        "Giao dịch yêu cầu xác thực bổ sung theo QĐ 2345/QĐ-NHNN (vượt hạn mức ngày tích luỹ), cần thanh toán thủ công"
                    ));
                } else if (e.getStatusCode().value() == 409) {
                    failedCount++;
                    details.add(new AutoPayItemResult(
                        reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                        "FAILED_INSUFFICIENT_FUNDS",
                        "Số dư ví không đủ hoặc vượt hạn mức giao dịch/tháng theo Điều 26 TT 40/2024"
                    ));
                } else {
                    failedCount++;
                    details.add(new AutoPayItemResult(
                        reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                        "FAILED_ERROR",
                        "Lỗi khi trích nợ ví: " + e.getMessage()
                    ));
                }
            } catch (HttpServerErrorException.ServiceUnavailable e) {
                // Issue #85: debit rejected before execution (eKYC unverifiable) — nothing was debited, no refund.
                billPaymentRepository.delete(pendingPayment);
                billPaymentRepository.flush();
                failedCount++;
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "FAILED_ERROR", WalletErrors.unavailable(e).getReason()
                ));
            } catch (Exception e) {
                billPaymentRepository.delete(pendingPayment);
                billPaymentRepository.flush();
                failedCount++;
                log.error("Lỗi khi thực hiện auto-debit cho regId={}: {}", reg.getId(), e.getMessage());
                details.add(new AutoPayItemResult(
                    reg.getId(), reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount,
                    "FAILED_ERROR",
                    "Lỗi hệ thống khi trích nợ ví: " + e.getMessage()
                ));
            }
        }

        return new AutoPayRunSummaryDto(candidates.size(), successCount, skippedCount, failedCount, details);
    }

    /** Deterministic mock "due amount": hash(category + customerCode) mapped into a
     * 50.000đ–2.000.000đ range, rounded to the nearest 1.000đ — same customer code + category
     * always quotes the same amount (so lookup and pay never disagree), but it is not a real
     * biller balance. */
    private BigDecimal mockDueAmount(BillCategory category, String customerCode) {
        if (customerCode != null && customerCode.trim().toUpperCase(Locale.ROOT).startsWith("STEPUP_")) {
            return new BigDecimal("12000000");
        }
        long hash = stableHash(category.name() + ":" + customerCode.trim().toUpperCase(Locale.ROOT));
        long range = 2_000_000 - 50_000;
        long amount = 50_000 + Math.floorMod(hash, range);
        return BigDecimal.valueOf(amount).setScale(0, RoundingMode.DOWN)
            .divide(BigDecimal.valueOf(1000), 0, RoundingMode.DOWN)
            .multiply(BigDecimal.valueOf(1000));
    }

    private String mockCustomerName(String customerCode) {
        String[] givenNames = {"An", "Bình", "Chi", "Dũng", "Hà", "Khoa", "Linh", "Minh", "Nga", "Phong"};
        long hash = stableHash("name:" + customerCode.trim().toUpperCase(Locale.ROOT));
        return "Khách hàng " + givenNames[(int) Math.floorMod(hash, givenNames.length)];
    }

    private long stableHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            long result = 0;
            for (int i = 0; i < 8; i++) {
                result = (result << 8) | (bytes[i] & 0xff);
            }
            return Math.abs(result);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private String describeCategory(BillCategory category) {
        return switch (category) {
            case ELECTRICITY -> "điện";
            case WATER -> "nước";
            case INTERNET -> "internet";
            case TV_CABLE -> "truyền hình cáp";
            case DIGITAL_SUBSCRIPTION, ENTERTAINMENT_STREAMING -> "dịch vụ số / giải trí";
            case APP_STORE_CODE -> "mã nạp ứng dụng";
        };
    }

    // --- Issue #89: Upcoming Bills Radar & Bill Spike Protection ---

    @Transactional
    public BillPaymentReceiptDto approveSpike(UUID id) {
        AutoBillRegistration reg = autoBillRegistrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy uỷ quyền thanh toán"));

        if (reg.getStatus() != AutoBillStatus.HELD_FOR_SPIKE_REVIEW) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uỷ quyền thanh toán không ở trạng thái chờ duyệt tăng đột biến");
        }

        BigDecimal amount = reg.getHeldAmount() != null ? reg.getHeldAmount() : mockDueAmount(reg.getCategory(), reg.getCustomerCode());
        String period = reg.getHeldPeriod() != null ? reg.getHeldPeriod() : LocalDate.now().format(PERIOD_FORMAT);

        // Trừ tiền ví chính
        WalletServiceClient.DebitResult debitResult;
        try {
            String note = "Thanh toán hoá đơn " + describeCategory(reg.getCategory()) + " kỳ " + period + " (Duyệt sau cảnh báo tăng giá)";
            debitResult = walletServiceClient.debit(reg.getUserId(), amount, reg.getCategory() + ":" + reg.getCustomerCode(), note, false);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, WalletErrors.conflictMessage(e, "Số dư không đủ để thanh toán hoá đơn"));
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trích nợ ví: " + e.getMessage());
        } catch (HttpServerErrorException.ServiceUnavailable e) {
            throw WalletErrors.unavailable(e);
        }

        BillPayment saved = billPaymentRepository.save(
            new BillPayment(reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount, period,
                BigDecimal.ZERO, null, amount, PaymentSource.MAIN_WALLET));

        reg.setStatus(AutoBillStatus.ACTIVE);
        reg.clearHeld();
        autoBillRegistrationRepository.save(reg);

        return new BillPaymentReceiptDto(
            saved.getId(), saved.getUserId(), saved.getCategory(), saved.getCustomerCode(),
            saved.getAmount(), debitResult.balance(), saved.getCreatedAt(),
            BigDecimal.ZERO, null, amount, PaymentSource.MAIN_WALLET);
    }

    public AutoBillRegistrationDto skipCycle(UUID id) {
        AutoBillRegistration reg = autoBillRegistrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy uỷ quyền thanh toán"));

        reg.setStatus(AutoBillStatus.ACTIVE);
        reg.clearHeld();
        return AutoBillRegistrationDto.from(autoBillRegistrationRepository.save(reg));
    }

    public UpcomingBillsRadarResponseDto getUpcomingRadar(UUID userId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate horizon7 = today.plusDays(7);
        int searchDays = days > 0 ? days : 30;
        LocalDate horizonEnd = today.plusDays(searchDays);
        String currentPeriod = today.format(PERIOD_FORMAT);

        List<UpcomingBillItemDto> items = new ArrayList<>();

        // 1. Quét AutoBillRegistration của user
        List<AutoBillRegistration> regs = autoBillRegistrationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (AutoBillRegistration reg : regs) {
            if (reg.getStatus() != AutoBillStatus.ACTIVE && reg.getStatus() != AutoBillStatus.HELD_FOR_SPIKE_REVIEW) {
                continue;
            }

            LocalDate dueDate;
            if (reg.getStatus() == AutoBillStatus.HELD_FOR_SPIKE_REVIEW) {
                dueDate = today;
            } else {
                int payDay = reg.getAutoPayDay();
                int dayThisMonth = Math.min(payDay, today.lengthOfMonth());
                LocalDate dueThisMonth = today.withDayOfMonth(dayThisMonth);
                boolean paidThisPeriod = billPaymentRepository.existsByCategoryAndCustomerCodeAndPeriod(
                    reg.getCategory(), reg.getCustomerCode(), currentPeriod);

                if (paidThisPeriod || dueThisMonth.isBefore(today)) {
                    LocalDate nextMonth = today.plusMonths(1);
                    dueDate = nextMonth.withDayOfMonth(Math.min(payDay, nextMonth.lengthOfMonth()));
                } else {
                    dueDate = dueThisMonth;
                }
            }

            if (!dueDate.isBefore(today) && !dueDate.isAfter(horizonEnd)) {
                BigDecimal expectedAmount = reg.getHeldAmount() != null
                    ? reg.getHeldAmount()
                    : mockDueAmount(reg.getCategory(), reg.getCustomerCode());

                // Tìm hoá đơn gần nhất trước đó
                List<BillPayment> history = billPaymentRepository
                    .findByUserIdAndCategoryAndCustomerCodeOrderByCreatedAtDesc(userId, reg.getCategory(), reg.getCustomerCode());
                Optional<BillPayment> prevBill = history.stream()
                    .filter(b -> !currentPeriod.equals(b.getPeriod()))
                    .findFirst();

                BigDecimal previousAmount = prevBill.map(BillPayment::getAmount).orElse(null);
                Double changePercent = null;
                boolean isSpikeDetected = reg.getStatus() == AutoBillStatus.HELD_FOR_SPIKE_REVIEW;

                if (previousAmount != null && previousAmount.signum() > 0) {
                    BigDecimal diff = expectedAmount.subtract(previousAmount);
                    changePercent = diff.multiply(BigDecimal.valueOf(100))
                        .divide(previousAmount, 1, RoundingMode.HALF_UP)
                        .doubleValue();
                    if (changePercent >= reg.getSpikeAlertThresholdPercent()) {
                        isSpikeDetected = true;
                    }
                }

                long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, dueDate);
                String title = "Hoá đơn " + describeCategory(reg.getCategory()) + " - " + reg.getCustomerCode();

                items.add(new UpcomingBillItemDto(
                    reg.getId(),
                    "AUTO_BILL",
                    title,
                    reg.getCustomerCode(),
                    dueDate,
                    daysUntilDue,
                    expectedAmount,
                    previousAmount,
                    changePercent,
                    isSpikeDetected,
                    reg.getStatus().name(),
                    reg.getHeldReason()
                ));
            }
        }

        // 2. Quét DigitalSubscriptionOrder của user
        if (digitalSubscriptionRepository != null) {
            List<DigitalSubscriptionOrder> subscriptions = digitalSubscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId);
            for (DigitalSubscriptionOrder sub : subscriptions) {
                // Giả định chu kỳ tái tục 30 ngày từ lúc mua
                LocalDate createdDate = sub.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate();
                LocalDate renewalDate = createdDate.plusDays(30);

                if (!renewalDate.isBefore(today) && !renewalDate.isAfter(horizonEnd)) {
                    long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, renewalDate);
                    items.add(new UpcomingBillItemDto(
                        sub.getId(),
                        "DIGITAL_SUBSCRIPTION",
                        sub.getPackageName(),
                        sub.getAccountIdentifier(),
                        renewalDate,
                        daysUntilDue,
                        sub.getPrice(),
                        sub.getPrice(),
                        0.0,
                        false,
                        "ACTIVE",
                        null
                    ));
                }
            }
        }

        // Sắp xếp theo dueDate tăng dần
        items.sort(Comparator.comparing(UpcomingBillItemDto::dueDate));

        BigDecimal totalDueNext7Days = BigDecimal.ZERO;
        BigDecimal totalDueNext30Days = BigDecimal.ZERO;

        for (UpcomingBillItemDto item : items) {
            if (!item.dueDate().isAfter(horizonEnd)) {
                totalDueNext30Days = totalDueNext30Days.add(item.expectedAmount());
            }
            if (!item.dueDate().isAfter(horizon7)) {
                totalDueNext7Days = totalDueNext7Days.add(item.expectedAmount());
            }
        }

        BigDecimal walletBalance = BigDecimal.ZERO;
        try {
            WalletServiceClient.WalletBalanceResponse bal = walletServiceClient.getBalance(userId);
            if (bal != null && bal.balance() != null) {
                walletBalance = bal.balance();
            }
        } catch (Exception e) {
            log.warn("Không thể lấy số dư ví của user {}: {}", userId, e.getMessage());
        }

        BigDecimal shortfallNext7Days = totalDueNext7Days.subtract(walletBalance).max(BigDecimal.ZERO);

        return new UpcomingBillsRadarResponseDto(
            items, totalDueNext7Days, totalDueNext30Days, walletBalance, shortfallNext7Days
        );
    }
}
