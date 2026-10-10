package com.ewalletlab.billpaymentservice.web;

import com.ewalletlab.billpaymentservice.service.InsuranceService;
import com.ewalletlab.billpaymentservice.web.dto.BuyPolicyRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.InsurancePolicyDto;
import com.ewalletlab.billpaymentservice.web.dto.InsuranceProductDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/insurance")
public class InsuranceController {

    private final InsuranceService insuranceService;

    public InsuranceController(InsuranceService insuranceService) {
        this.insuranceService = insuranceService;
    }

    @GetMapping("/products")
    public List<InsuranceProductDto> getProducts() {
        return insuranceService.getProducts();
    }

    @PostMapping("/policies")
    public ResponseEntity<InsurancePolicyDto> buyPolicy(@Valid @RequestBody BuyPolicyRequestDto request) {
        InsurancePolicyDto policy = insuranceService.buyPolicy(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(policy);
    }

    @GetMapping("/policies")
    public List<InsurancePolicyDto> getPolicies(@RequestParam UUID userId) {
        return insuranceService.getPolicies(userId);
    }

    @GetMapping("/policies/{id}/certificate")
    public InsurancePolicyDto getCertificate(@PathVariable UUID id) {
        return insuranceService.getCertificate(id);
    }
}
