package com.ewalletlab.investmentfundservice.service;

import com.ewalletlab.investmentfundservice.domain.InvestmentFund;
import com.ewalletlab.investmentfundservice.domain.InvestmentHolding;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrder;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrderType;
import com.ewalletlab.investmentfundservice.repository.InvestmentFundRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentHoldingRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentOrderRepository;
import com.ewalletlab.investmentfundservice.repository.NavHistoryRepository;
import com.ewalletlab.investmentfundservice.web.dto.BuyOrderRequestDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDto;
import com.ewalletlab.investmentfundservice.web.dto.HoldingDto;
import com.ewalletlab.investmentfundservice.web.dto.InvestmentOrderDto;
import com.ewalletlab.investmentfundservice.web.dto.SellOrderRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvestmentFundServiceTests {

    @Mock
    private InvestmentFundRepository fundRepository;

    @Mock
    private NavHistoryRepository historyRepository;

    @Mock
    private InvestmentHoldingRepository holdingRepository;

    @Mock
    private InvestmentOrderRepository orderRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    @Mock
    private InvestmentMutationExecutor mutationExecutor;

    private InvestmentFundService service;

    private final UUID userId = UUID.randomUUID();
    private final UUID fundId = UUID.randomUUID();
    private InvestmentFund sampleFund;

    @BeforeEach
    void setUp() {
        service = new InvestmentFundService(fundRepository, historyRepository, holdingRepository,
            orderRepository, walletServiceClient, mutationExecutor);

        sampleFund = new InvestmentFund(fundId, "VESAF", "VinaCapital Equity Special Access Fund",
            "Quỹ cổ phiếu đặc thù", new BigDecimal("25450.0000"));
    }

    @Nested
    @DisplayName("buy() tests")
    class BuyOrderTests {

        @Test
        @DisplayName("Chưa đồng ý điều khoản rủi ro (disclaimerAccepted = false/null) ném 400 Bad Request")
        void buy_disclaimerNotAccepted_throwsBadRequest() {
            var reqFalse = new BuyOrderRequestDto(userId, fundId, new BigDecimal("100000"), false, false);
            ResponseStatusException ex1 = assertThrows(ResponseStatusException.class, () -> service.buy(reqFalse));
            assertEquals(HttpStatus.BAD_REQUEST, ex1.getStatusCode());
            assertTrue(ex1.getReason().contains("cần xác nhận đồng ý với 4 điểm cảnh báo rủi ro"));

            var reqNull = new BuyOrderRequestDto(userId, fundId, new BigDecimal("100000"), false, null);
            ResponseStatusException ex2 = assertThrows(ResponseStatusException.class, () -> service.buy(reqNull));
            assertEquals(HttpStatus.BAD_REQUEST, ex2.getStatusCode());
        }

        @Test
        @DisplayName("Quỹ đầu tư không tồn tại ném 404 Not Found")
        void buy_fundNotFound_throwsNotFound() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.empty());

            var req = new BuyOrderRequestDto(userId, fundId, new BigDecimal("100000"), false, true);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.buy(req));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Không tìm thấy quỹ đầu tư"));
        }

        @Test
        @DisplayName("Ví không đủ tiền / xung đột (409 Conflict từ wallet-service) ném 409 Conflict")
        void buy_walletInsufficientBalance_throwsConflict() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));
            when(walletServiceClient.debitBuy(eq(userId), any(), any(), any(), eq(false)))
                .thenThrow(HttpClientErrorException.create(
                    HttpStatus.CONFLICT, "Conflict", HttpHeaders.EMPTY, new byte[0], StandardCharsets.UTF_8));

            var req = new BuyOrderRequestDto(userId, fundId, new BigDecimal("100000"), false, true);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.buy(req));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Không thể trích nợ ví: số dư không đủ"));
            verifyNoInteractions(mutationExecutor);
        }

        @Test
        @DisplayName("Giao dịch trên 10 triệu cần step-up (428 từ wallet-service) ném 428 Precondition Required")
        void buy_walletStepUpRequired_throwsPreconditionRequired() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));
            when(walletServiceClient.debitBuy(eq(userId), any(), any(), any(), eq(false)))
                .thenThrow(HttpClientErrorException.create(
                    HttpStatusCode.valueOf(428), "Precondition Required", HttpHeaders.EMPTY,
                    "Cần sinh trắc học theo QĐ 2345".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));

            var req = new BuyOrderRequestDto(userId, fundId, new BigDecimal("15000000"), false, true);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.buy(req));

            assertEquals(HttpStatus.PRECONDITION_REQUIRED, ex.getStatusCode());
            assertTrue(ex.getReason().contains("QĐ 2345"));
            verifyNoInteractions(mutationExecutor);
        }

        @Test
        @DisplayName("Ví điện tử không phản hồi (503/timeout) ném 502 Bad Gateway")
        void buy_walletUnavailable_throwsBadGateway() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));
            when(walletServiceClient.debitBuy(eq(userId), any(), any(), any(), eq(false)))
                .thenThrow(new ResourceAccessException("Connection timed out"));

            var req = new BuyOrderRequestDto(userId, fundId, new BigDecimal("100000"), false, true);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.buy(req));

            assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Không thể kết nối tới dịch vụ ví điện tử"));
            verifyNoInteractions(mutationExecutor);
        }

        @Test
        @DisplayName("Mua CCQ thành công làm tròn số CCQ theo HALF_UP 4 chữ số thập phân")
        void buy_success_recordsHoldingAndOrderWithCorrectNavRounding() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));

            BigDecimal amount = new BigDecimal("100000");
            // 100_000 / 25_450 = 3.929273... -> HALF_UP 4 decimals = 3.9293
            BigDecimal expectedUnits = amount.divide(sampleFund.getNav(), 4, RoundingMode.HALF_UP);
            assertEquals(new BigDecimal("3.9293"), expectedUnits);

            InvestmentOrder savedOrder = new InvestmentOrder(
                userId, fundId, InvestmentOrderType.BUY, amount, expectedUnits, sampleFund.getNav());
            when(mutationExecutor.recordHoldingBuyOnce(userId, fundId, amount, sampleFund.getNav(), expectedUnits))
                .thenReturn(savedOrder);

            var req = new BuyOrderRequestDto(userId, fundId, amount, true, true);
            InvestmentOrderDto result = service.buy(req);

            assertNotNull(result);
            assertEquals(InvestmentOrderType.BUY, result.type());
            assertEquals(amount, result.amount());
            assertEquals(expectedUnits, result.units());
            assertEquals(sampleFund.getNav(), result.nav());
            assertEquals("VESAF", result.fundCode());

            verify(walletServiceClient).debitBuy(eq(userId), eq(amount), eq(fundId.toString()), any(), eq(true));
            verify(mutationExecutor).recordHoldingBuyOnce(userId, fundId, amount, sampleFund.getNav(), expectedUnits);
        }

        @Test
        @DisplayName("Cạnh tranh ghi nhận holding retry và thành công ở lần 2")
        void buy_optimisticLockRetry_succeeds() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));

            BigDecimal amount = new BigDecimal("100000");
            BigDecimal expectedUnits = amount.divide(sampleFund.getNav(), 4, RoundingMode.HALF_UP);
            InvestmentOrder savedOrder = new InvestmentOrder(
                userId, fundId, InvestmentOrderType.BUY, amount, expectedUnits, sampleFund.getNav());

            when(mutationExecutor.recordHoldingBuyOnce(userId, fundId, amount, sampleFund.getNav(), expectedUnits))
                .thenThrow(new ObjectOptimisticLockingFailureException(InvestmentHolding.class, userId))
                .thenReturn(savedOrder);

            var req = new BuyOrderRequestDto(userId, fundId, amount, false, true);
            InvestmentOrderDto result = service.buy(req);

            assertNotNull(result);
            verify(mutationExecutor, times(2))
                .recordHoldingBuyOnce(userId, fundId, amount, sampleFund.getNav(), expectedUnits);
        }
    }

    @Nested
    @DisplayName("sell() tests")
    class SellOrderTests {

        @Test
        @DisplayName("Quỹ không tồn tại ném 404 Not Found")
        void sell_fundNotFound_throwsNotFound() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.empty());

            var req = new SellOrderRequestDto(userId, fundId, new BigDecimal("10.5"), false);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.sell(req));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("Bán khi chưa sở hữu CCQ (sellAll = true) ném 409 Conflict")
        void sell_notHoldingFund_sellAll_throwsConflict() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));
            when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.empty());

            var req = new SellOrderRequestDto(userId, fundId, null, true);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.sell(req));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
            assertTrue(ex.getReason().contains("Bạn chưa sở hữu chứng chỉ quỹ này"));
        }

        @Test
        @DisplayName("Số lượng bán <= 0 hoặc null khi không phải sellAll ném 400 Bad Request")
        void sell_unitsZeroOrNegative_throwsBadRequest() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));

            var reqNull = new SellOrderRequestDto(userId, fundId, null, false);
            ResponseStatusException ex1 = assertThrows(ResponseStatusException.class, () -> service.sell(reqNull));
            assertEquals(HttpStatus.BAD_REQUEST, ex1.getStatusCode());

            var reqZero = new SellOrderRequestDto(userId, fundId, BigDecimal.ZERO, false);
            ResponseStatusException ex2 = assertThrows(ResponseStatusException.class, () -> service.sell(reqZero));
            assertEquals(HttpStatus.BAD_REQUEST, ex2.getStatusCode());
        }

        @Test
        @DisplayName("Bán tất cả (sellAll = true) trích xuất chính xác toàn bộ units từ holding")
        void sellAll_usesAllHoldingUnits() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));
            InvestmentHolding holding = new InvestmentHolding(userId, fundId);
            holding.addUnits(new BigDecimal("15.5000"), new BigDecimal("350000"));
            when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.of(holding));

            UUID orderId = UUID.randomUUID();
            BigDecimal proceeds = new BigDecimal("394475"); // 15.5 * 25450
            when(mutationExecutor.deductUnitsOnce(userId, fundId, new BigDecimal("15.5000"), sampleFund.getNav()))
                .thenReturn(new InvestmentMutationExecutor.DeductUnitsResult(orderId, proceeds, new BigDecimal("15.5000"), new BigDecimal("350000")));

            var req = new SellOrderRequestDto(userId, fundId, null, true);
            InvestmentOrderDto result = service.sell(req);

            assertNotNull(result);
            assertEquals(InvestmentOrderType.SELL, result.type());
            assertEquals(proceeds, result.amount());
            assertEquals(new BigDecimal("15.5000"), result.units());
            verify(walletServiceClient).creditSell(eq(userId), eq(proceeds), eq(fundId.toString()), any());
        }

        @Test
        @DisplayName("Bán thành công: Khấu trừ units cục bộ và cộng tiền vào ví")
        void sell_success_deductsUnitsAndCreditsWallet() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));

            BigDecimal unitsToSell = new BigDecimal("5.0000");
            BigDecimal proceeds = new BigDecimal("127250"); // 5 * 25450
            UUID orderId = UUID.randomUUID();

            when(mutationExecutor.deductUnitsOnce(userId, fundId, unitsToSell, sampleFund.getNav()))
                .thenReturn(new InvestmentMutationExecutor.DeductUnitsResult(
                    orderId, proceeds, unitsToSell, new BigDecimal("100000")));

            var req = new SellOrderRequestDto(userId, fundId, unitsToSell, false);
            InvestmentOrderDto result = service.sell(req);

            assertNotNull(result);
            assertEquals(InvestmentOrderType.SELL, result.type());
            assertEquals(proceeds, result.amount());
            assertEquals(unitsToSell, result.units());

            verify(mutationExecutor).deductUnitsOnce(userId, fundId, unitsToSell, sampleFund.getNav());
            verify(walletServiceClient).creditSell(eq(userId), eq(proceeds), eq(fundId.toString()), any());
        }

        @Test
        @DisplayName("BỒI HOÀN (COMPENSATION): Khi credit ví thất bại -> phục hồi lại units và ném 502")
        void sell_walletCreditFails_compensatesUnitsAndThrowsBadGateway() {
            when(fundRepository.findById(fundId)).thenReturn(Optional.of(sampleFund));

            BigDecimal unitsToSell = new BigDecimal("8.0000");
            BigDecimal proceeds = new BigDecimal("203600");
            BigDecimal investedReduction = new BigDecimal("180000");
            UUID orderId = UUID.randomUUID();

            when(mutationExecutor.deductUnitsOnce(userId, fundId, unitsToSell, sampleFund.getNav()))
                .thenReturn(new InvestmentMutationExecutor.DeductUnitsResult(
                    orderId, proceeds, unitsToSell, investedReduction));

            // Mô phỏng ví điện tử sập khi credit
            when(walletServiceClient.creditSell(eq(userId), eq(proceeds), any(), any()))
                .thenThrow(new HttpServerErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Ví lỗi máy chủ"));

            var req = new SellOrderRequestDto(userId, fundId, unitsToSell, false);
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> service.sell(req));

            assertEquals(HttpStatus.BAD_GATEWAY, ex.getStatusCode());
            assertTrue(ex.getReason().contains("số lượng chứng chỉ quỹ đã được hoàn lại đầy đủ"));

            // Xác minh kích hoạt saga bù trừ: compensateSellOnce được gọi đúng tham số
            verify(mutationExecutor, times(1))
                .compensateSellOnce(userId, fundId, orderId, unitsToSell, investedReduction);
        }
    }

    @Nested
    @DisplayName("Holdings and Return Rate calculation tests")
    class CalculationTests {

        @Test
        @DisplayName("Tính đúng giá trị hiện tại, lãi/lỗ và tỷ suất sinh lời của danh mục đầu tư")
        void getUserHoldings_calculatesProfitAndPercentage() {
            InvestmentHolding holding = new InvestmentHolding(userId, fundId);
            holding.addUnits(new BigDecimal("10.0000"), new BigDecimal("200000")); // giá vốn 200.000
            when(holdingRepository.findByUserIdOrderByUpdatedAtDesc(userId)).thenReturn(List.of(holding));
            when(fundRepository.findAll()).thenReturn(List.of(sampleFund)); // NAV 25.450 -> giá trị 254.500

            List<HoldingDto> holdings = service.getUserHoldings(userId);

            assertEquals(1, holdings.size());
            HoldingDto dto = holdings.getFirst();
            assertEquals("VESAF", dto.fundCode());
            assertEquals(new BigDecimal("10.0000"), dto.units());
            assertEquals(new BigDecimal("200000.00"), dto.totalInvested());
            // currentValue = 10 * 25450 = 254500
            assertEquals(new BigDecimal("254500"), dto.currentValue());
            // profitAmount = 254500 - 200000 = 54500
            assertEquals(new BigDecimal("54500.00"), dto.profitAmount());
            // profitPct = 54500 / 200000 * 100 = 27.25%
            assertEquals(new BigDecimal("27.2500"), dto.profitPct());
        }

        @Test
        @DisplayName("Tính đúng tỷ suất sinh lời của quỹ so với initialNav")
        void listFunds_calculatesReturnRate() {
            // initialNav = 25450, nav = 25450 -> returnRate = 0
            when(fundRepository.findAll()).thenReturn(List.of(sampleFund));

            List<FundDto> funds = service.listFunds();

            assertEquals(1, funds.size());
            assertEquals(new BigDecimal("0.0000"), funds.getFirst().returnRatePct());

            // Tăng NAV lên 28000
            sampleFund.setNav(new BigDecimal("28000.0000"));
            List<FundDto> fundsAfterTick = service.listFunds();
            // (28000 - 25450) / 25450 * 100 = 2550 / 25450 * 100 = 10.0196%
            BigDecimal expectedRate = new BigDecimal("2550.0000")
                .divide(new BigDecimal("25450.0000"), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
            assertEquals(expectedRate, fundsAfterTick.getFirst().returnRatePct());
        }
    }
}
