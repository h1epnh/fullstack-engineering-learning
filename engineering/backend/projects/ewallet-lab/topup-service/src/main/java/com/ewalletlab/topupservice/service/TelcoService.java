package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.TelcoOrder;
import com.ewalletlab.topupservice.domain.TelcoOrderStatus;
import com.ewalletlab.topupservice.domain.TelcoOrderType;
import com.ewalletlab.topupservice.domain.TelcoProvider;
import com.ewalletlab.topupservice.repository.TelcoOrderRepository;
import com.ewalletlab.topupservice.web.dto.CreateTelcoOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.TelcoOrderDto;
import com.ewalletlab.topupservice.web.dto.TelcoPackageDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class TelcoService {

    private static final Set<BigDecimal> VALID_DENOMINATIONS = Set.of(
        new BigDecimal("10000"),
        new BigDecimal("20000"),
        new BigDecimal("50000"),
        new BigDecimal("100000"),
        new BigDecimal("200000"),
        new BigDecimal("500000")
    );

    private static final Pattern VN_PHONE_PATTERN = Pattern.compile("^0[35789]\\d{8}$");

    private final TelcoOrderRepository telcoOrderRepository;
    private final MockTelcoGateway mockTelcoGateway;
    private final WalletServiceClient walletServiceClient;

    public TelcoService(TelcoOrderRepository telcoOrderRepository,
                        MockTelcoGateway mockTelcoGateway,
                        WalletServiceClient walletServiceClient) {
        this.telcoOrderRepository = telcoOrderRepository;
        this.mockTelcoGateway = mockTelcoGateway;
        this.walletServiceClient = walletServiceClient;
    }

    public List<TelcoPackageDto> getAvailablePackages() {
        List<TelcoPackageDto> packages = new ArrayList<>();
        List<BigDecimal> sortedDenoms = VALID_DENOMINATIONS.stream()
            .sorted()
            .toList();

        for (TelcoProvider provider : TelcoProvider.values()) {
            BigDecimal discountRate = getDiscountRate(provider);
            String providerName = switch (provider) {
                case VIETTEL -> "Viettel Telecom";
                case VINAPHONE -> "Vinaphone";
                case MOBIFONE -> "MobiFone";
            };

            for (BigDecimal denom : sortedDenoms) {
                BigDecimal finalPrice = denom.multiply(BigDecimal.ONE.subtract(discountRate))
                    .setScale(0, RoundingMode.HALF_UP);
                packages.add(new TelcoPackageDto(provider, providerName, denom, discountRate, finalPrice));
            }
        }
        return packages;
    }

    public BigDecimal getDiscountRate(TelcoProvider provider) {
        return switch (provider) {
            case VIETTEL -> new BigDecimal("0.0200");
            case VINAPHONE, MOBIFONE -> new BigDecimal("0.0250");
        };
    }

    public TelcoOrderDto createOrder(CreateTelcoOrderRequestDto request) {
        // 1. Validate denomination
        if (!VALID_DENOMINATIONS.contains(request.denomination())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Mệnh giá nạp không hợp lệ. Chỉ chấp nhận các mệnh giá: 10.000, 20.000, 50.000, 100.000, 200.000, 500.000 VND");
        }

        // 2. Validate phone number for direct topup
        if (request.orderType() == TelcoOrderType.DIRECT_TOPUP) {
            if (request.phoneNumber() == null || !VN_PHONE_PATTERN.matcher(request.phoneNumber().trim()).matches()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Số điện thoại nạp không đúng định dạng di động Việt Nam (10 chữ số, đầu 03/05/07/08/09)");
            }
        }

        BigDecimal discountRate = getDiscountRate(request.telcoProvider());
        BigDecimal finalPrice = request.denomination()
            .multiply(BigDecimal.ONE.subtract(discountRate))
            .setScale(0, RoundingMode.HALF_UP);

        String note = request.orderType() == TelcoOrderType.DIRECT_TOPUP
            ? "Nạp ĐT trực tiếp " + request.telcoProvider() + " (" + request.phoneNumber() + ")"
            : "Mua mã thẻ cào " + request.telcoProvider() + " " + request.denomination() + "đ";

        // 3. Synchronously debit user wallet (BILL_PAYMENT type enforces monthly cap + step-up auth)
        walletServiceClient.debit(
            request.userId(),
            finalPrice,
            "BILL_PAYMENT",
            note,
            request.isStepUpConfirmed()
        );

        // 4. Record pending order
        TelcoOrder order = new TelcoOrder(
            request.userId(),
            request.phoneNumber() != null ? request.phoneNumber().trim() : null,
            request.telcoProvider(),
            request.orderType(),
            request.denomination(),
            discountRate,
            finalPrice,
            TelcoOrderStatus.PENDING
        );
        order = telcoOrderRepository.save(order);

        // 5. Execute gateway or generate card pin
        if (request.orderType() == TelcoOrderType.DIRECT_TOPUP) {
            MockTelcoGateway.ExecutionResult execResult = mockTelcoGateway.executeDirectTopup(
                request.telcoProvider(),
                request.phoneNumber().trim(),
                request.denomination()
            );

            if (!execResult.success()) {
                // Compensating saga refund: refund the exact finalPrice back to user's wallet
                walletServiceClient.credit(
                    request.userId(),
                    finalPrice,
                    "REFUND",
                    "Hoàn tiền nạp ĐT thất bại: " + request.telcoProvider() + " (" + execResult.errorMessage() + ")"
                );
                order.markFailedRefunded(execResult.errorMessage());
                order = telcoOrderRepository.save(order);
                return TelcoOrderDto.fromEntity(order);
            }

            order.markCompleted(null, null);
            order = telcoOrderRepository.save(order);
            return TelcoOrderDto.fromEntity(order);
        } else {
            // CARD_PIN
            MockTelcoGateway.CardPinResult pinResult = mockTelcoGateway.generateCardPin(
                request.telcoProvider(),
                request.denomination()
            );
            order.markCompleted(pinResult.pinCode(), pinResult.serialNumber());
            order = telcoOrderRepository.save(order);
            return TelcoOrderDto.fromEntity(order);
        }
    }

    public List<TelcoOrderDto> getOrdersByUserId(UUID userId) {
        return telcoOrderRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(TelcoOrderDto::fromEntity)
            .toList();
    }

    public TelcoOrderDto getOrderById(UUID id) {
        return telcoOrderRepository.findById(id)
            .map(TelcoOrderDto::fromEntity)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng viễn thông"));
    }
}
