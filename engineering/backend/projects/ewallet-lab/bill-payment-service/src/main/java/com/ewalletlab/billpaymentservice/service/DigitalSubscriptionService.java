package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.domain.DigitalSubscriptionOrder;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.repository.DigitalSubscriptionRepository;
import com.ewalletlab.billpaymentservice.web.dto.DigitalServicePackageDto;
import com.ewalletlab.billpaymentservice.web.dto.DigitalSubscriptionOrderDto;
import com.ewalletlab.billpaymentservice.web.dto.SubscribeDigitalServiceRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@Service
public class DigitalSubscriptionService {

    private static final Map<String, DigitalServicePackageDto> CATALOG = new LinkedHashMap<>();

    static {
        CATALOG.put("SPOTIFY_PREMIUM_1M", new DigitalServicePackageDto(
            "SPOTIFY_PREMIUM_1M",
            "Spotify Premium (1 Tháng)",
            "Spotify",
            BillCategory.ENTERTAINMENT_STREAMING,
            new BigDecimal("59000"),
            "30 ngày",
            "Nghe nhạc không quảng cáo, tải nhạc offline chất lượng cao"
        ));
        CATALOG.put("NETFLIX_STANDARD_1M", new DigitalServicePackageDto(
            "NETFLIX_STANDARD_1M",
            "Netflix Tiêu Chuẩn (1 Tháng)",
            "Netflix",
            BillCategory.ENTERTAINMENT_STREAMING,
            new BigDecimal("260000"),
            "30 ngày",
            "Xem phim Full HD trên 2 thiết bị cùng lúc không quảng cáo"
        ));
        CATALOG.put("VIEON_VIP_1M", new DigitalServicePackageDto(
            "VIEON_VIP_1M",
            "VieON VIP (1 Tháng)",
            "VieON",
            BillCategory.ENTERTAINMENT_STREAMING,
            new BigDecimal("69000"),
            "30 ngày",
            "Xem trọn vẹn kho phim bom tấn, truyền hình trực tuyến và show độc quyền"
        ));
        CATALOG.put("GOOGLE_PLAY_CODE_100K", new DigitalServicePackageDto(
            "GOOGLE_PLAY_CODE_100K",
            "Mã nạp Google Play 100.000đ",
            "Google Play",
            BillCategory.APP_STORE_CODE,
            new BigDecimal("100000"),
            "Không thời hạn",
            "Nạp số dư tài khoản CH Play để mua ứng dụng, game và nội dung số"
        ));
        CATALOG.put("APPLE_SERVICES_CODE_100K", new DigitalServicePackageDto(
            "APPLE_SERVICES_CODE_100K",
            "Mã thẻ Apple Gift Card 100.000đ",
            "Apple Services",
            BillCategory.APP_STORE_CODE,
            new BigDecimal("100000"),
            "Không thời hạn",
            "Sử dụng cho App Store, Apple Music, iCloud+ và Apple TV+"
        ));
    }

    private final DigitalSubscriptionRepository subscriptionRepository;
    private final BillPaymentRepository billPaymentRepository;
    private final WalletServiceClient walletServiceClient;
    private final SecureRandom random = new SecureRandom();

    public DigitalSubscriptionService(DigitalSubscriptionRepository subscriptionRepository,
                                      BillPaymentRepository billPaymentRepository,
                                      WalletServiceClient walletServiceClient) {
        this.subscriptionRepository = subscriptionRepository;
        this.billPaymentRepository = billPaymentRepository;
        this.walletServiceClient = walletServiceClient;
    }

    public List<DigitalServicePackageDto> getCatalog() {
        return new ArrayList<>(CATALOG.values());
    }

    @Transactional
    public DigitalSubscriptionOrderDto subscribe(SubscribeDigitalServiceRequestDto request) {
        DigitalServicePackageDto pkg = CATALOG.get(request.packageCode());
        if (pkg == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Gói dịch vụ số không tồn tại: " + request.packageCode());
        }

        String identifier = request.accountIdentifier() != null ? request.accountIdentifier().trim() : "";
        if (identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tài khoản thụ hưởng (email hoặc số điện thoại) không được để trống");
        }

        // 1. Debit wallet
        String note = "Thanh toán " + pkg.packageName() + " cho " + identifier;
        try {
            walletServiceClient.debit(
                request.userId(),
                pkg.price(),
                note,
                request.isStepUpConfirmed()
            );
        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            if (status == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), "Giao dịch cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN");
            } else if (status == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để thanh toán gói dịch vụ số");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trích nợ ví: " + e.getMessage());
        }

        // 2. Generate unique period for ledger
        String period = "SUB-" + UUID.randomUUID().toString().substring(0, 8) + "-" + Instant.now().toEpochMilli();

        // 3. Save BillPayment to preserve ledger completeness
        BillPayment billPayment = new BillPayment(
            request.userId(),
            pkg.category(),
            identifier,
            pkg.price(),
            period,
            BigDecimal.ZERO,
            null,
            pkg.price()
        );
        billPayment = billPaymentRepository.save(billPayment);

        // 4. Generate Activation Code
        String activationCode = generateActivationCode(pkg.packageCode());

        // 5. Save DigitalSubscriptionOrder
        DigitalSubscriptionOrder order = new DigitalSubscriptionOrder(
            request.userId(),
            pkg.packageCode(),
            pkg.packageName(),
            pkg.category(),
            pkg.price(),
            identifier,
            activationCode,
            billPayment.getId()
        );
        order = subscriptionRepository.save(order);

        return DigitalSubscriptionOrderDto.fromEntity(order);
    }

    public List<DigitalSubscriptionOrderDto> getHistory(UUID userId) {
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(DigitalSubscriptionOrderDto::fromEntity)
            .toList();
    }

    public DigitalSubscriptionOrderDto getOrder(UUID id) {
        return subscriptionRepository.findById(id)
            .map(DigitalSubscriptionOrderDto::fromEntity)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng dịch vụ số"));
    }

    private String generateActivationCode(String packageCode) {
        String prefix = switch (packageCode) {
            case "SPOTIFY_PREMIUM_1M" -> "SPTI";
            case "NETFLIX_STANDARD_1M" -> "NFLX";
            case "VIEON_VIP_1M" -> "VEON";
            case "GOOGLE_PLAY_CODE_100K" -> "GPLY";
            case "APPLE_SERVICES_CODE_100K" -> "APPL";
            default -> "SUBS";
        };
        char[] chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
        StringBuilder part1 = new StringBuilder();
        StringBuilder part2 = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            part1.append(chars[random.nextInt(chars.length)]);
            part2.append(chars[random.nextInt(chars.length)]);
        }
        return prefix + "-" + part1 + "-" + part2;
    }
}
