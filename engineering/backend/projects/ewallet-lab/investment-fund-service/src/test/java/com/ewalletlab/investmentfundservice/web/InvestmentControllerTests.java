package com.ewalletlab.investmentfundservice.web;

import com.ewalletlab.investmentfundservice.domain.InvestmentOrderType;
import com.ewalletlab.investmentfundservice.service.InvestmentFundService;
import com.ewalletlab.investmentfundservice.service.NavSimulationService;
import com.ewalletlab.investmentfundservice.web.dto.BuyOrderRequestDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDto;
import com.ewalletlab.investmentfundservice.web.dto.InvestmentOrderDto;
import com.ewalletlab.investmentfundservice.web.dto.SellOrderRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InvestmentControllerTests {

    @Mock
    private InvestmentFundService investmentService;

    @Mock
    private NavSimulationService simulationService;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final UUID userId = UUID.randomUUID();
    private final UUID fundId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new InvestmentController(investmentService, simulationService)).build();
    }

    @Test
    @DisplayName("GET /investments/disclaimer trả về 200 và 4 điểm cảnh báo rủi ro")
    void getDisclaimer_returns200AndPoints() throws Exception {
        mockMvc.perform(get("/investments/disclaimer"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requiredPoints.length()").value(4));
    }

    @Test
    @DisplayName("GET /investments/funds trả về 200 và danh sách quỹ")
    void listFunds_returns200() throws Exception {
        FundDto fundDto = new FundDto(fundId, "VESAF", "VinaCapital Special Access", "Desc",
            new BigDecimal("25450"), new BigDecimal("25450"), BigDecimal.ZERO, Instant.now());
        when(investmentService.listFunds()).thenReturn(List.of(fundDto));

        mockMvc.perform(get("/investments/funds"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].code").value("VESAF"))
            .andExpect(jsonPath("$[0].nav").value(25450));
    }

    @Test
    @DisplayName("POST /investments/orders/buy số tiền < 10.000đ trả về 400 Bad Request")
    void buy_belowMinimum_returns400() throws Exception {
        Map<String, Object> req = Map.of(
            "userId", userId.toString(),
            "fundId", fundId.toString(),
            "amount", 9999,
            "disclaimerAccepted", true
        );

        mockMvc.perform(post("/investments/orders/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Số tiền đầu tư tối thiểu là 10.000đ"));
    }

    @Test
    @DisplayName("POST /investments/orders/buy số tiền > 100.000.000đ trả về 400 Bad Request")
    void buy_exceedsMaximum_returns400() throws Exception {
        Map<String, Object> req = Map.of(
            "userId", userId.toString(),
            "fundId", fundId.toString(),
            "amount", 100000001,
            "disclaimerAccepted", true
        );

        mockMvc.perform(post("/investments/orders/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Số tiền đầu tư tối đa mỗi giao dịch là 100.000.000đ"));
    }

    @Test
    @DisplayName("POST /investments/orders/buy hợp lệ trả về 201 Created kèm order DTO")
    void buy_valid_returns201() throws Exception {
        InvestmentOrderDto orderDto = new InvestmentOrderDto(
            UUID.randomUUID(), fundId, "VESAF", "VinaCapital Special", InvestmentOrderType.BUY,
            new BigDecimal("100000"), new BigDecimal("3.9293"), new BigDecimal("25450"), Instant.now()
        );
        when(investmentService.buy(any(BuyOrderRequestDto.class))).thenReturn(orderDto);

        Map<String, Object> req = Map.of(
            "userId", userId.toString(),
            "fundId", fundId.toString(),
            "amount", 100000,
            "disclaimerAccepted", true
        );

        mockMvc.perform(post("/investments/orders/buy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("BUY"))
            .andExpect(jsonPath("$.amount").value(100000))
            .andExpect(jsonPath("$.units").value(3.9293));
    }

    @Test
    @DisplayName("POST /investments/orders/sell số lượng < 0.0001 trả về 400 Bad Request")
    void sell_unitsBelowMinimum_returns400() throws Exception {
        Map<String, Object> req = Map.of(
            "userId", userId.toString(),
            "fundId", fundId.toString(),
            "units", 0.00001
        );

        mockMvc.perform(post("/investments/orders/sell")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Số lượng chứng chỉ quỹ bán phải lớn hơn 0"));
    }

    @Test
    @DisplayName("POST /investments/orders/sell hợp lệ trả về 201 Created")
    void sell_valid_returns201() throws Exception {
        InvestmentOrderDto orderDto = new InvestmentOrderDto(
            UUID.randomUUID(), fundId, "VESAF", "VinaCapital Special", InvestmentOrderType.SELL,
            new BigDecimal("127250"), new BigDecimal("5.0000"), new BigDecimal("25450"), Instant.now()
        );
        when(investmentService.sell(any(SellOrderRequestDto.class))).thenReturn(orderDto);

        Map<String, Object> req = Map.of(
            "userId", userId.toString(),
            "fundId", fundId.toString(),
            "units", 5.0
        );

        mockMvc.perform(post("/investments/orders/sell")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.type").value("SELL"))
            .andExpect(jsonPath("$.amount").value(127250))
            .andExpect(jsonPath("$.units").value(5.0));
    }
}
