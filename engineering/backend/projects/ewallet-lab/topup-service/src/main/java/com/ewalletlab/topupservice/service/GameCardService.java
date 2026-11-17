package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import com.ewalletlab.topupservice.domain.GamePublisher;
import com.ewalletlab.topupservice.repository.GameCardOrderRepository;
import com.ewalletlab.topupservice.web.dto.CreateGameCardOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.GameCardOrderDto;
import com.ewalletlab.topupservice.web.dto.GameCardPackageDto;
import com.ewalletlab.topupservice.domain.GameCardOrderStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
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

    private static final Logger log = LoggerFactory.getLogger(GameCardService.class);
    private static final Duration STALE_PENDING = Duration.ofSeconds(60);

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

    /**
     * Claim-first saga (principles 3 + 7), deliberately NOT @Transactional: the wallet debit is a
     * remote call and must not hold a DB transaction/connection open.
     *  1. Claim: insert PENDING order with UNIQUE idempotencyKey (local lock; loser of a race sees
     *     the constraint violation and treats it as a replay).
     *  2. Debit wallet synchronously (value is only issued after money is taken), with
     *     reference=orderId and wallet-side idempotency key.
     *  3. Issue PIN/serial + mark COMPLETED. If this fails, refund with key "refund:<debitKey>".
     */
    public GameCardOrderDto purchaseGameCard(CreateGameCardOrderRequestDto request) {
        if (!VALID_GAME_DENOMINATIONS.contains(request.denomination())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Mệnh giá thẻ game không hợp lệ. Chỉ chấp nhận các mệnh giá: 20.000, 50.000, 100.000, 200.000, 500.000 VND");
        }

        BigDecimal finalPrice = request.denomination()
            .multiply(BigDecimal.ONE.subtract(GAME_CARD_DISCOUNT_RATE))
            .setScale(0, RoundingMode.HALF_UP);

        String clientKey = (request.idempotencyKey() == null || request.idempotencyKey().isBlank())
            ? UUID.randomUUID().toString() : request.idempotencyKey().trim();
        String debitKey = "gamecard:" + request.userId() + ":" + clientKey;

        Optional<GameCardOrder> existing = gameCardOrderRepository.findByIdempotencyKey(debitKey);
        if (existing.isPresent()) {
            return replay(existing.get(), request, finalPrice, debitKey);
        }

        GameCardOrder claim = new GameCardOrder(request.userId(), request.publisher(), request.denomination(),
            GAME_CARD_DISCOUNT_RATE, finalPrice, debitKey);
        try {
            claim = gameCardOrderRepository.saveAndFlush(claim);
        } catch (DataIntegrityViolationException race) {
            GameCardOrder winner = gameCardOrderRepository.findByIdempotencyKey(debitKey).orElseThrow(() -> race);
            return replay(winner, request, finalPrice, debitKey);
        }
        return fulfil(claim.getId(), claim.getFulfillToken(), request, finalPrice, debitKey);
    }

    private static final String REFUND_UNCONFIRMED = "REFUND_UNCONFIRMED: không phát hành thẻ; hoàn tiền chờ xác nhận";
    private static final String REFUND_CONFIRMED = "Không phát hành được thẻ; đã hoàn tiền";

    private GameCardOrderDto replay(GameCardOrder existing, CreateGameCardOrderRequestDto request,
                                    BigDecimal finalPrice, String debitKey) {
        if (existing.getPublisher() != request.publisher()
            || existing.getDenomination().compareTo(request.denomination()) != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "idempotencyKey đã được dùng cho một đơn mua khác");
        }
        switch (existing.getStatus()) {
            case COMPLETED:
                return GameCardOrderDto.fromEntity(existing);
            case FAILED_REFUNDED:
                // The refund decision is already atomic and final. If the credit was never confirmed,
                // re-apply it: same key "refund:<debitKey>" so it can credit at most once.
                if (existing.getFailureReason() != null && existing.getFailureReason().startsWith("REFUND_UNCONFIRMED")) {
                    applyRefund(existing.getId(), existing.getUserId(), finalPrice, debitKey);
                }
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Đơn mua với idempotencyKey này đã thất bại và được hoàn tiền; hãy dùng key mới để mua lại");
            default:
                // PENDING: someone holds the fulfiller claim. It is only resumable when the claim is
                // stale, and then only ONE resumer wins the token swap (conditional UPDATE); the old
                // holder, if merely slow, is fenced out because its token no longer matches.
                if (existing.getFulfillStartedAt().isAfter(Instant.now().minus(STALE_PENDING))) {
                    throw inProgress();
                }
                String newToken = UUID.randomUUID().toString();
                if (gameCardOrderRepository.takeOverIf(existing.getId(), existing.getFulfillToken(),
                        newToken, Instant.now()) == 1) {
                    return fulfil(existing.getId(), newToken, request, finalPrice, debitKey);
                }
                return resultOfWinner(existing.getId());
        }
    }

    private ResponseStatusException inProgress() {
        return new ResponseStatusException(HttpStatus.CONFLICT,
            "Đơn mua thẻ đang được xử lý, vui lòng thử lại sau giây lát");
    }

    /** I lost an atomic transition: someone else owns the outcome. Never refund here — re-read. */
    private GameCardOrderDto resultOfWinner(UUID orderId) {
        GameCardOrder current = gameCardOrderRepository.findById(orderId)
            .orElseThrow(() -> inProgress());
        if (current.getStatus() == GameCardOrderStatus.COMPLETED) {
            return GameCardOrderDto.fromEntity(current);
        }
        throw inProgress();
    }

    private GameCardOrderDto fulfil(UUID orderId, String token, CreateGameCardOrderRequestDto request,
                                    BigDecimal finalPrice, String debitKey) {
        String note = "Mua thẻ " + getPublisherName(request.publisher()) + " "
            + request.denomination().toBigInteger() + "đ (chiết khấu 3%)";

        try {
            walletServiceClient.debit(request.userId(), finalPrice, "BILL_PAYMENT",
                orderId.toString(), note, request.stepUpConfirmed(), debitKey);
        } catch (HttpClientErrorException definitiveRejection) {
            // 4xx (409 insufficient balance, 428 step-up...): nothing was debited. Release the claim
            // (only if I still hold it) so the same key can be retried.
            gameCardOrderRepository.deleteClaimIf(orderId, token);
            throw definitiveRejection;
        }
        // Any other failure (timeout/5xx) is ambiguous: leave PENDING; a stale-claim resume is idempotent.

        int issued;
        try {
            issued = gameCardOrderRepository.completeIf(orderId, token, generatePin(), generateSerial(), "31/12/2027");
        } catch (RuntimeException completeFailure) {
            log.error("Completing game card order {} failed after debit", orderId, completeFailure);
            return refundIfProvablySafe(orderId, token, request, finalPrice, debitKey, completeFailure);
        }
        if (issued == 0) {
            // Fenced out (claim taken over) or already completed by someone else: NOT a failure.
            return resultOfWinner(orderId);
        }
        return GameCardOrderDto.fromEntity(gameCardOrderRepository.findById(orderId).orElseThrow());
    }

    /** Refund only when no card was, or ever can be, issued: the atomic PENDING->FAILED_REFUNDED
     * transition (conditional on my token) is the proof. Anything else = no refund. */
    private GameCardOrderDto refundIfProvablySafe(UUID orderId, String token, CreateGameCardOrderRequestDto request,
                                                  BigDecimal finalPrice, String debitKey, RuntimeException cause) {
        int decided;
        try {
            decided = gameCardOrderRepository.failForRefundIf(orderId, token, REFUND_UNCONFIRMED);
        } catch (RuntimeException cannotProve) {
            // Cannot prove the order is un-issued (e.g. DB unreachable): leave PENDING, never refund.
            log.error("Cannot prove order {} un-issued; NOT refunding (resume will finish it)", orderId, cannotProve);
            throw cause;
        }
        if (decided == 0) {
            return resultOfWinner(orderId); // someone else completed it / holds the claim
        }
        applyRefund(orderId, request.userId(), finalPrice, debitKey);
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
            "Không thể phát hành thẻ, tiền đã được hoàn lại vào ví");
    }

    private void applyRefund(UUID orderId, UUID userId, BigDecimal finalPrice, String debitKey) {
        try {
            walletServiceClient.credit(userId, finalPrice, "REFUND", orderId.toString(),
                "Hoàn tiền mua thẻ game thất bại", "refund:" + debitKey);
        } catch (RuntimeException refundFailure) {
            log.error("REFUND FAILED for order {} key {} — stays REFUND_UNCONFIRMED, replay retries it",
                orderId, debitKey, refundFailure);
            throw refundFailure;
        }
        try {
            gameCardOrderRepository.setFailureReason(orderId, REFUND_CONFIRMED);
        } catch (RuntimeException ignored) {
            log.warn("Could not mark refund confirmed for order {} (credit already applied)", orderId);
        }
    }

    private String generatePin() {
        return String.format("%04d %04d %04d %04d", 1000 + random.nextInt(9000), 1000 + random.nextInt(9000),
            1000 + random.nextInt(9000), 1000 + random.nextInt(9000));
    }

    private String generateSerial() {
        return String.format("%04d %04d %04d", 1000 + random.nextInt(9000), 1000 + random.nextInt(9000),
            1000 + random.nextInt(9000));
    }

    public List<GameCardOrderDto> getOrdersByUserId(UUID userId) {
        return gameCardOrderRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, GameCardOrderStatus.COMPLETED)
            .stream()
            .map(GameCardOrderDto::fromEntity)
            .toList();
    }
}
