package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.service.TelcoService;
import com.ewalletlab.topupservice.web.dto.CreateTelcoOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.TelcoOrderDto;
import com.ewalletlab.topupservice.web.dto.TelcoPackageDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/telco")
public class TelcoController {

    private final TelcoService telcoService;

    public TelcoController(TelcoService telcoService) {
        this.telcoService = telcoService;
    }

    @GetMapping("/packages")
    public List<TelcoPackageDto> getPackages() {
        return telcoService.getAvailablePackages();
    }

    @PostMapping("/orders")
    public ResponseEntity<TelcoOrderDto> createOrder(@Valid @RequestBody CreateTelcoOrderRequestDto request) {
        TelcoOrderDto order = telcoService.createOrder(request);
        HttpStatus status = order.status().name().equals("FAILED_REFUNDED")
            ? HttpStatus.OK
            : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(order);
    }

    @GetMapping("/orders")
    public List<TelcoOrderDto> getOrders(@RequestParam UUID userId) {
        return telcoService.getOrdersByUserId(userId);
    }

    @GetMapping("/orders/{id}")
    public TelcoOrderDto getOrderById(@PathVariable UUID id) {
        return telcoService.getOrderById(id);
    }

    @ExceptionHandler(HttpClientErrorException.Conflict.class)
    public ResponseEntity<String> handleConflict(HttpClientErrorException.Conflict e) {
        String msg = e.getResponseBodyAsString();
        if (msg.isBlank()) {
            msg = "Số dư ví không đủ hoặc vượt hạn mức tháng";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(msg);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<String> handleHttpClientError(HttpClientErrorException e) {
        if (e.getStatusCode().value() == 428) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED).body(e.getResponseBodyAsString());
        }
        return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
    }
}
