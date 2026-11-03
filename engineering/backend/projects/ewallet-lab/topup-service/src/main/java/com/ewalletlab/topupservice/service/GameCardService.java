package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import com.ewalletlab.topupservice.domain.GamePublisher;
import com.ewalletlab.topupservice.repository.GameCardOrderRepository;
import com.ewalletlab.topupservice.web.dto.CreateGameCardOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.GameCardOrderDto;
import com.ewalletlab.topupservice.web.dto.GameCardPackageDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.util.*;

@Service
public class GameCardService {

    public static final Set<BigDecimal> VALID_GAME_DENOMINATIONS = Set.of(
        new BigDecimal("20000"),
        new BigDecimal("50000"),
        new BigDecimal("100000"),
        new BigDecimal("200000"),
        new BigDecimal("500000")
    );

    public static final BigDecimal GAME_CARD_DISCOUNT_RATE = new BigDecimal("0.0300"); // 3%

    private final GameCardOrderRepository gameCardOrderRepository;
    private final WalletServiceClient walletServiceClient;
    private final SecureRandom random = new SecureRandom();

    public GameCardService(GameCardOrderRepository gameCardOrderRepository,
                           WalletServiceClient walletServiceClient) {
        this.gameCardOrderRepository = gameCardOrderRepository;
        this.walletServiceClient = walletServiceClient;
    }

    public List<GameCardPackageDto> getAvailablePackages() {
        List<GameCardPackageDto> packages = new ArrayList<>();
        List<BigDecimal> sortedDenoms = VALID_GAME_DENOMINATIONS.stream()
            .sorted()
            .toList();

        for (GamePublisher pub : GamePublisher.values()) {
            String name = getPublisherName(pub);
            String desc = getPublisherDesc(pub);

            for (BigDecimal denom : sortedDenoms) {
                BigDecimal finalPrice = denom.multiply(BigDecimal.ONE.subtract(GAME_CARD_DISCOUNT_RATE))
                    .setScale(0, RoundingMode.HALF_UP);
                packages.add(new GameCardPackageDto(pub, name, desc, denom, GAME_CARD_DISCOUNT_RATE, finalPrice));
            }
        }
        return packages;
    }

    public String getPublisherName(GamePublisher pub) {
        return switch (pub) {
            case GARENA -> "Garena";
            case ZING -> "Zing Card";
            case VCOIN -> "Vcoin";
            case GATE -> "Gate";
            case FUNCARD -> "Funcard";
            case APPOTA -> "Appota Card";
            case GOOGLE_PLAY -> "Google Play Gift Code";
        };
    }

    public String getPublisherDesc(GamePublisher pub) {
        return switch (pub) {
            case GARENA -> "Liên Quân, Free Fire, FC Online";
            case ZING -> "VNGGames, PUBG Mobile, Valorant";
            case VCOIN -> "VTC Game, Audition, Đột Kích";
            case GATE -> "Thẻ game FPT Online";
            case FUNCARD -> "Nạp game Funtap";
            case APPOTA -> "Nạp game Gamota";
            case GOOGLE_PLAY -> "Nạp số dư CH Play Android";
        };
    }

    @Transactional
    public GameCardOrderDto purchaseGameCard(CreateGameCardOrderRequestDto request) {
        // 1. Validate denomination
        if (!VALID_GAME_DENOMINATIONS.contains(request.denomination())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Mệnh giá thẻ game không hợp lệ. Chỉ chấp nhận các mệnh giá: 20.000, 50.000, 100.000, 200.000, 500.000 VND");
        }

        BigDecimal finalPrice = request.denomination()
            .multiply(BigDecimal.ONE.subtract(GAME_CARD_DISCOUNT_RATE))
            .setScale(0, RoundingMode.HALF_UP);

        String publisherName = getPublisherName(request.publisher());
        String note = "Mua thẻ " + publisherName + " " + request.denomination().toBigInteger() + "đ (chiết khấu 3%)";

        // 2. Synchronously debit user wallet
        walletServiceClient.debit(
            request.userId(),
            finalPrice,
            "BILL_PAYMENT",
            note,
            request.stepUpConfirmed()
        );

        // 3. Generate PIN 16 digits and Serial 12 digits
        long pinPart1 = 1000 + random.nextInt(9000);
        long pinPart2 = 1000 + random.nextInt(9000);
        long pinPart3 = 1000 + random.nextInt(9000);
        long pinPart4 = 1000 + random.nextInt(9000);
        String pinCode = String.format("%04d %04d %04d %04d", pinPart1, pinPart2, pinPart3, pinPart4);

        long serialPart1 = 1000 + random.nextInt(9000);
        long serialPart2 = 1000 + random.nextInt(9000);
        long serialPart3 = 1000 + random.nextInt(9000);
        String serialNumber = String.format("%04d %04d %04d", serialPart1, serialPart2, serialPart3);

        String expiryDate = "31/12/2027";

        // 4. Save order
        GameCardOrder order = new GameCardOrder(
            request.userId(),
            request.publisher(),
            request.denomination(),
            GAME_CARD_DISCOUNT_RATE,
            finalPrice,
            pinCode,
            serialNumber,
            expiryDate
        );

        order = gameCardOrderRepository.save(order);
        return GameCardOrderDto.fromEntity(order);
    }

    public List<GameCardOrderDto> getOrdersByUserId(UUID userId) {
        return gameCardOrderRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(GameCardOrderDto::fromEntity)
            .toList();
    }
}
