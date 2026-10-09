package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.AutoBillRegistration;
import com.ewalletlab.billpaymentservice.domain.AutoBillStatus;
import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
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

    public BillPaymentService(BillPaymentRepository billPaymentRepository,
                              AutoBillRegistrationRepository autoBillRegistrationRepository,
                              WalletServiceClient walletServiceClient,
                              LoyaltyServiceClient loyaltyServiceClient) {
        this.billPaymentRepository = billPaymentRepository;
        this.autoBillRegistrationRepository = autoBillRegistrationRepository;
        this.walletServiceClient = walletServiceClient;
        this.loyaltyServiceClient = loyaltyServiceClient;
    }

    public BillLookupResponse lookup(BillCategory category, String customerCode) {
        BigDecimal amount = mockDueAmount(category, customerCode);
        String customerName = mockCustomerName(customerCode);
        String period = "Kỳ " + LocalDate.now().format(PERIOD_FORMAT);
        return new BillLookupResponse(category, customerCode, customerName, amount, period);
    }

    public BillPaymentReceiptDto pay(BillPayRequestDto request) {
        BigDecimal originalAmount = mockDueAmount(request.category(), request.customerCode());
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
                // Dùng status code value thay vì instanceof subclass (HttpClientErrorException.Conflict/
                // BadRequest) — bền hơn khi exception được tạo qua đường khác (vd. test tự construct
                // bằng constructor base class) không trúng đúng subclass cụ thể.
                int status = e.getStatusCode().value();
                if (status == 409) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher đã được sử dụng hoặc không còn khả dụng");
                } else if (status == 400) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getResponseBodyAsString());
                }
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể xác thực voucher: " + e.getMessage());
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể xác thực voucher: " + e.getMessage());
            }
        }

        // 2. Trừ tiền ví chính với finalAmount
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
            // Hoàn lại voucher nếu trừ ví thất bại (áp dụng cho MỌI lỗi HTTP từ wallet-service,
            // không chỉ riêng status code đã có subclass cụ thể trong Spring — tránh bug
            // "instanceof subclass" không khớp khi exception được tạo qua
            // HttpClientErrorException.create() với subclass khác không mong đợi).
            if (request.voucherId() != null) {
                loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
            }
            int status = e.getStatusCode().value();
            if (status == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), "Giao dịch cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN");
            } else if (status == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để thanh toán hoá đơn");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trích nợ ví: " + e.getMessage());
        } catch (Exception e) {
            // Hoàn lại voucher nếu có lỗi không phải lỗi HTTP (network, timeout, v.v.)
            if (request.voucherId() != null) {
                loyaltyServiceClient.revertVoucher(request.voucherId(), request.userId());
            }
            throw e;
        }

        String period = LocalDate.now().format(PERIOD_FORMAT);
        BillPayment saved = billPaymentRepository.save(
            new BillPayment(request.userId(), request.category(), request.customerCode(), originalAmount, period,
                discountAmount, request.voucherId(), finalAmount));

        return new BillPaymentReceiptDto(
            saved.getId(), saved.getUserId(), saved.getCategory(), saved.getCustomerCode(),
            saved.getAmount(), debitResult.balance(), saved.getCreatedAt(),
            discountAmount, request.voucherId(), finalAmount);
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
            return AutoBillRegistrationDto.from(autoBillRegistrationRepository.save(reg));
        }

        AutoBillRegistration reg = new AutoBillRegistration(
            req.userId(), req.category(), req.customerCode(), req.maxAmount(), req.autoPayDay()
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

            // 4. Execute payment with Concurrency Protection (Claim trước, debit sau)
            BillPayment pendingPayment;
            try {
                pendingPayment = billPaymentRepository.saveAndFlush(
                    new BillPayment(reg.getUserId(), reg.getCategory(), reg.getCustomerCode(), amount, period));
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
}
