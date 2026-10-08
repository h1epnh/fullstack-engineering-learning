package com.ewalletlab.investmentfundservice.web;

import com.ewalletlab.investmentfundservice.domain.InvestmentFund;
import com.ewalletlab.investmentfundservice.service.InvestmentFundService;
import com.ewalletlab.investmentfundservice.service.NavSimulationService;
import com.ewalletlab.investmentfundservice.web.dto.BuyOrderRequestDto;
import com.ewalletlab.investmentfundservice.web.dto.DisclaimerDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDetailDto;
import com.ewalletlab.investmentfundservice.web.dto.FundDto;
import com.ewalletlab.investmentfundservice.web.dto.HoldingDto;
import com.ewalletlab.investmentfundservice.web.dto.InvestmentOrderDto;
import com.ewalletlab.investmentfundservice.web.dto.SellOrderRequestDto;
import com.ewalletlab.investmentfundservice.web.dto.SetNavRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/investments")
public class InvestmentController {

    private final InvestmentFundService investmentService;
    private final NavSimulationService simulationService;

    public InvestmentController(InvestmentFundService investmentService,
                                NavSimulationService simulationService) {
        this.investmentService = investmentService;
        this.simulationService = simulationService;
    }

    @GetMapping("/disclaimer")
    public DisclaimerDto getDisclaimer() {
        return DisclaimerDto.standard();
    }

    @GetMapping("/funds")
    public List<FundDto> listFunds() {
        return investmentService.listFunds();
    }

    @GetMapping("/funds/{id}")
    public FundDetailDto getFundDetail(@PathVariable UUID id) {
        return investmentService.getFundDetail(id);
    }

    @GetMapping("/holdings")
    public List<HoldingDto> getUserHoldings(@RequestParam UUID userId) {
        return investmentService.getUserHoldings(userId);
    }

    @GetMapping("/orders")
    public List<InvestmentOrderDto> getUserOrders(@RequestParam UUID userId) {
        return investmentService.getUserOrders(userId);
    }

    @PostMapping("/orders/buy")
    public ResponseEntity<InvestmentOrderDto> buyOrder(@Valid @RequestBody BuyOrderRequestDto req) {
        InvestmentOrderDto result = investmentService.buy(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/orders/sell")
    public ResponseEntity<InvestmentOrderDto> sellOrder(@Valid @RequestBody SellOrderRequestDto req) {
        InvestmentOrderDto result = investmentService.sell(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/funds/tick-nav")
    public List<FundDto> tickNav() {
        simulationService.tickAllFunds();
        return investmentService.listFunds();
    }

    @PostMapping("/funds/{id}/set-nav")
    public FundDetailDto setNav(@PathVariable UUID id, @Valid @RequestBody SetNavRequestDto req) {
        simulationService.setFundNav(id, req.nav());
        return investmentService.getFundDetail(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException e) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", e.getStatusCode().value());
        body.put("error", e.getReason());
        body.put("message", e.getReason());
        return ResponseEntity.status(e.getStatusCode()).body(body);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> handleOptimisticLock(ObjectOptimisticLockingFailureException e) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Giao dịch đang được xử lý đồng thời, vui lòng thử lại");
        body.put("message", "Giao dịch đang được xử lý đồng thời, vui lòng thử lại");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("Dữ liệu đầu vào không hợp lệ");
        Map<String, Object> body = new HashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", msg);
        body.put("message", msg);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}

