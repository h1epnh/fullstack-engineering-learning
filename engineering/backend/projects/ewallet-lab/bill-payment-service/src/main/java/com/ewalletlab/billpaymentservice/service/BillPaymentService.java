package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.web.dto.BillLookupResponse;
import com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.BillPaymentReceiptDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Mock biller lookup + pay. There is no public spec to bind to for bill aggregation (README's
 * "không có spec MoMo công khai" section) — this is intentionally, plainly a mock: the "due
 * amount" is a deterministic hash of (category, customerCode), not a real biller integration.
 *
 * <p><strong>Synchronous by design, not an oversight:</strong> unlike topup-service's
 * mock-bank-gateway (ACK now, confirm later via IPN) or transfer-service's saga, a mock biller has
 * no external async settlement step to simulate — paying debits the wallet and returns a receipt
 * in one call. See DESIGN.md's "Luồng bill payment" section.
 */
@Service
public class BillPaymentService {

    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private final BillPaymentRepository billPaymentRepository;
    private final WalletServiceClient walletServiceClient;

    public BillPaymentService(BillPaymentRepository billPaymentRepository, WalletServiceClient walletServiceClient) {
        this.billPaymentRepository = billPaymentRepository;
        this.walletServiceClient = walletServiceClient;
    }

    public BillLookupResponse lookup(BillCategory category, String customerCode) {
        BigDecimal amount = mockDueAmount(category, customerCode);
        String customerName = mockCustomerName(customerCode);
        String period = "Kỳ " + LocalDate.now().format(PERIOD_FORMAT);
        return new BillLookupResponse(category, customerCode, customerName, amount, period);
    }

    public BillPaymentReceiptDto pay(BillPayRequestDto request) {
        BigDecimal amount = mockDueAmount(request.category(), request.customerCode());
        WalletServiceClient.DebitResult debitResult;
        try {
            debitResult = walletServiceClient.debit(
                request.userId(), amount,
                request.category() + ":" + request.customerCode(),
                "Thanh toán hoá đơn " + describeCategory(request.category()) + " (mock biller)");
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để thanh toán hoá đơn");
        }

        BillPayment saved = billPaymentRepository.save(
            new BillPayment(request.userId(), request.category(), request.customerCode(), amount));

        return new BillPaymentReceiptDto(
            saved.getId(), saved.getUserId(), saved.getCategory(), saved.getCustomerCode(),
            saved.getAmount(), debitResult.balance(), saved.getCreatedAt());
    }

    public List<BillPayment> history(java.util.UUID userId) {
        return billPaymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
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
        };
    }
}
