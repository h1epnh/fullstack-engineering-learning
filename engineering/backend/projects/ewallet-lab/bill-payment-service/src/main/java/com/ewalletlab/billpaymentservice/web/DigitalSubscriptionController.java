package com.ewalletlab.billpaymentservice.web;

import com.ewalletlab.billpaymentservice.service.DigitalSubscriptionService;
import com.ewalletlab.billpaymentservice.web.dto.DigitalServicePackageDto;
import com.ewalletlab.billpaymentservice.web.dto.DigitalSubscriptionOrderDto;
import com.ewalletlab.billpaymentservice.web.dto.SubscribeDigitalServiceRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bills/digital-services")
public class DigitalSubscriptionController {

    private final DigitalSubscriptionService subscriptionService;

    public DigitalSubscriptionController(DigitalSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<DigitalServicePackageDto> getCatalog() {
        return subscriptionService.getCatalog();
    }

    @PostMapping("/subscribe")
    public ResponseEntity<DigitalSubscriptionOrderDto> subscribe(@Valid @RequestBody SubscribeDigitalServiceRequestDto request) {
        DigitalSubscriptionOrderDto order = subscriptionService.subscribe(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/history")
    public List<DigitalSubscriptionOrderDto> getHistory(@RequestParam UUID userId) {
        return subscriptionService.getHistory(userId);
    }

    @GetMapping("/{id}")
    public DigitalSubscriptionOrderDto getOrder(@PathVariable UUID id) {
        return subscriptionService.getOrder(id);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }
}
