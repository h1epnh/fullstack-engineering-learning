package com.ewalletlab.investmentfundservice.service;

import com.ewalletlab.investmentfundservice.domain.InvestmentFund;
import com.ewalletlab.investmentfundservice.domain.InvestmentHolding;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrder;
import com.ewalletlab.investmentfundservice.domain.NavHistory;
import com.ewalletlab.investmentfundservice.repository.InvestmentFundRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentHoldingRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentOrderRepository;
import com.ewalletlab.investmentfundservice.repository.NavHistoryRepository;
import com.ewalletlab.investmentfundservice.web.dto.BuyOrderRequestDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDetailDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDto;
import com.ewalletlab.investmentfundservice.web.dto.HoldingDto;
import com.ewalletlab.investmentfundservice.web.dto.InvestmentOrderDto;
import com.ewalletlab.investmentfundservice.web.dto.NavHistoryDto;
import com.ewalletlab.investmentfundservice.web.dto.SellOrderRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class InvestmentFundService {

    private static final Logger log = LoggerFactory.getLogger(InvestmentFundService.class);

    private static final int MAX_ATTEMPTS = 10;
    private static final int MAX_COMPENSATION_ATTEMPTS = 30;

    private final InvestmentFundRepository fundRepository;
    private final NavHistoryRepository historyRepository;
    private final InvestmentHoldingRepository holdingRepository;
    private final InvestmentOrderRepository orderRepository;
    private final WalletServiceClient walletServiceClient;
    private final InvestmentMutationExecutor mutationExecutor;

    public InvestmentFundService(InvestmentFundRepository fundRepository,
                                 NavHistoryRepository historyRepository,
                                 InvestmentHoldingRepository holdingRepository,
                                 InvestmentOrderRepository orderRepository,
                                 WalletServiceClient walletServiceClient,
                                 InvestmentMutationExecutor mutationExecutor) {
        this.fundRepository = fundRepository;
        this.historyRepository = historyRepository;
        this.holdingRepository = holdingRepository;
        this.orderRepository = orderRepository;
        this.walletServiceClient = walletServiceClient;
        this.mutationExecutor = mutationExecutor;
    }

    public List<FundDto> listFunds() {
        return fundRepository.findAll().stream()
            .map(this::toFundDto)
            .toList();
    }

    public FundDetailDto getFundDetail(UUID fundId) {
        InvestmentFund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ đầu tư"));
        List<NavHistoryDto> history = historyRepository.findByFundIdOrderByRecordedAtDesc(fundId).stream()
            .map(h -> new NavHistoryDto(h.getId(), h.getNav(), h.getRecordedAt()))
            .toList();
        return new FundDetailDto(toFundDto(fund), history);
    }

    public List<HoldingDto> getUserHoldings(UUID userId) {
        List<InvestmentHolding> holdings = holdingRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        Map<UUID, InvestmentFund> fundMap = fundRepository.findAll().stream()
            .collect(Collectors.toMap(InvestmentFund::getId, Function.identity()));

        return holdings.stream()
            .map(h -> {
                InvestmentFund fund = fundMap.get(h.getFundId());
                String code = fund != null ? fund.getCode() : "UNKNOWN";
                String name = fund != null ? fund.getName() : "Quỹ không xác định";
                BigDecimal nav = fund != null ? fund.getNav() : BigDecimal.ZERO;
                BigDecimal currentValue = h.getUnits().multiply(nav).setScale(0, RoundingMode.HALF_UP);
                BigDecimal profitAmount = currentValue.subtract(h.getTotalInvested());
                BigDecimal profitPct = h.getTotalInvested().compareTo(BigDecimal.ZERO) > 0
                    ? profitAmount.divide(h.getTotalInvested(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

                return new HoldingDto(
                    h.getFundId(),
                    code,
                    name,
                    h.getUnits(),
                    nav,
                    h.getTotalInvested(),
                    currentValue,
                    profitAmount,
                    profitPct,
                    h.getUpdatedAt()
                );
            })
            .toList();
    }

    public List<InvestmentOrderDto> getUserOrders(UUID userId) {
        Map<UUID, InvestmentFund> fundMap = fundRepository.findAll().stream()
            .collect(Collectors.toMap(InvestmentFund::getId, Function.identity()));

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
            .map(o -> {
                InvestmentFund fund = fundMap.get(o.getFundId());
                String code = fund != null ? fund.getCode() : "UNKNOWN";
                String name = fund != null ? fund.getName() : "Quỹ không xác định";
                return new InvestmentOrderDto(
                    o.getId(),
                    o.getFundId(),
                    code,
                    name,
                    o.getType(),
                    o.getAmount(),
                    o.getUnits(),
                    o.getNav(),
                    o.getCreatedAt()
                );
            })
            .toList();
    }

    public InvestmentOrderDto buy(BuyOrderRequestDto req) {
        if (!Boolean.TRUE.equals(req.disclaimerAccepted())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Bạn cần xác nhận đồng ý với 4 điểm cảnh báo rủi ro đầu tư trước khi mua chứng chỉ quỹ");
        }

        InvestmentFund fund = fundRepository.findById(req.fundId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ đầu tư"));

        BigDecimal nav = fund.getNav();
        BigDecimal units = req.amount().divide(nav, 4, RoundingMode.HALF_UP);
        boolean stepUp = Boolean.TRUE.equals(req.stepUpConfirmed());

        // 1. Debit wallet-service first
        try {
            walletServiceClient.debitBuy(req.userId(), req.amount(), fund.getId().toString(),
                "Mua chứng chỉ quỹ " + fund.getCode(), stepUp);
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Không thể trích nợ ví: số dư không đủ hoặc vượt hạn mức tháng (Điều 26 TT 40/2024)");
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 428) {
                // StepUpRequiredException from wallet-service (issue #15)
                throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED,
                    e.getResponseBodyAsString().isEmpty() ? "Giao dịch cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN" : e.getResponseBodyAsString());
            }
            throw new ResponseStatusException(HttpStatus.valueOf(e.getStatusCode().value()),
                "Lỗi từ ví điện tử: " + e.getStatusText());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Không thể kết nối tới dịch vụ ví điện tử");
        }

        // 2. Debit succeeded. Record holding with optimistic-locking retry
        InvestmentOrder order = withOptimisticLockRetry("buy-record-holding", () ->
            mutationExecutor.recordHoldingBuyOnce(req.userId(), fund.getId(), req.amount(), nav, units)
        );

        return new InvestmentOrderDto(
            order.getId(),
            fund.getId(),
            fund.getCode(),
            fund.getName(),
            order.getType(),
            order.getAmount(),
            order.getUnits(),
            order.getNav(),
            order.getCreatedAt()
        );
    }

    public InvestmentOrderDto sell(SellOrderRequestDto req) {
        InvestmentFund fund = fundRepository.findById(req.fundId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy quỹ đầu tư"));

        BigDecimal currentNav = fund.getNav();
        BigDecimal unitsToSell;

        if (Boolean.TRUE.equals(req.sellAll())) {
            InvestmentHolding holding = holdingRepository.findByUserIdAndFundId(req.userId(), req.fundId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Bạn chưa sở hữu chứng chỉ quỹ này"));
            unitsToSell = holding.getUnits();
        } else {
            if (req.units() == null || req.units().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng chứng chỉ quỹ bán phải lớn hơn 0");
            }
            unitsToSell = req.units();
        }

        if (unitsToSell.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không có chứng chỉ quỹ để bán");
        }

        // 1. Claim/deduct units locally first with optimistic locking
        InvestmentMutationExecutor.DeductUnitsResult deductResult = withOptimisticLockRetry("sell-deduct-units", () ->
            mutationExecutor.deductUnitsOnce(req.userId(), fund.getId(), unitsToSell, currentNav)
        );

        // 2. Credit wallet
        try {
            walletServiceClient.creditSell(req.userId(), deductResult.proceeds(), fund.getId().toString(),
                "Bán chứng chỉ quỹ " + fund.getCode());
        } catch (Exception e) {
            log.error("Credit ví thất bại cho giao dịch bán orderId={}, kích hoạt bồi hoàn units: {}",
                deductResult.orderId(), e.getMessage());
            compensateSellWithRetry(req.userId(), fund.getId(), deductResult.orderId(),
                deductResult.unitsDeducted(), deductResult.investedReduction());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Không thể cộng tiền vào ví chính, số lượng chứng chỉ quỹ đã được hoàn lại đầy đủ");
        }

        return new InvestmentOrderDto(
            deductResult.orderId(),
            fund.getId(),
            fund.getCode(),
            fund.getName(),
            com.ewalletlab.investmentfundservice.domain.InvestmentOrderType.SELL,
            deductResult.proceeds(),
            deductResult.unitsDeducted(),
            currentNav,
            java.time.Instant.now()
        );
    }

    private void compensateSellWithRetry(UUID userId, UUID fundId, UUID orderId, BigDecimal units, BigDecimal invested) {
        for (int i = 1; i <= MAX_COMPENSATION_ATTEMPTS; i++) {
            try {
                mutationExecutor.compensateSellOnce(userId, fundId, orderId, units, invested);
                log.info("Bồi hoàn thành công cho orderId={} ở lần thử {}/{}", orderId, i, MAX_COMPENSATION_ATTEMPTS);
                return;
            } catch (ObjectOptimisticLockingFailureException e) {
                if (i == MAX_COMPENSATION_ATTEMPTS) {
                    log.error("INVESTMENT_MONEY_STUCK: Bồi hoàn bán CCQ thất bại sau {} lần cho userId={}, orderId={}",
                        MAX_COMPENSATION_ATTEMPTS, userId, orderId);
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Hệ thống tạm thời chưa thể hoàn lại CCQ sau lỗi ví, mã tham chiếu: " + orderId);
                }
                long sleepMs = Math.min(20L * i, 150L) + ThreadLocalRandom.current().nextInt(0, 40);
                sleep(sleepMs);
            }
        }
    }

    private <T> T withOptimisticLockRetry(String op, Supplier<T> attempt) {
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
            try {
                return attempt.get();
            } catch (ObjectOptimisticLockingFailureException | DataIntegrityViolationException e) {
                if (i == MAX_ATTEMPTS) {
                    log.warn("{} lost optimistic lock / data integrity race {} times in a row", op, MAX_ATTEMPTS);
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Giao dịch đang được xử lý đồng thời, vui lòng thử lại");
                }
                sleep(10L * i);
            }
        }
        throw new IllegalStateException("unreachable");
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private FundDto toFundDto(InvestmentFund f) {
        BigDecimal returnRate = f.getInitialNav().compareTo(BigDecimal.ZERO) > 0
            ? f.getNav().subtract(f.getInitialNav())
                .divide(f.getInitialNav(), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        return new FundDto(
            f.getId(),
            f.getCode(),
            f.getName(),
            f.getDescription(),
            f.getNav(),
            f.getInitialNav(),
            returnRate,
            f.getUpdatedAt()
        );
    }
}

