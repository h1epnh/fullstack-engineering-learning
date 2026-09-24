package com.ewalletlab.billpaymentservice.web;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.service.BillPaymentService;
import com.ewalletlab.billpaymentservice.web.dto.BillLookupResponse;
import com.ewalletlab.billpaymentservice.web.dto.BillPayRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.BillPaymentReceiptDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bills")
public class BillPaymentController {

    private final BillPaymentService billPaymentService;

    public BillPaymentController(BillPaymentService billPaymentService) {
        this.billPaymentService = billPaymentService;
    }

    /** Mock biller lookup — see BillPaymentService's class Javadoc for why this is deterministic
     * mock data, not a real integration. */
    @GetMapping("/lookup")
    public BillLookupResponse lookup(@RequestParam BillCategory category, @RequestParam String customerCode) {
        return billPaymentService.lookup(category, customerCode);
    }

    @PostMapping("/pay")
    public BillPaymentReceiptDto pay(@Valid @RequestBody BillPayRequestDto request) {
        return billPaymentService.pay(request);
    }

    @GetMapping("/history/{userId}")
    public List<BillPayment> history(@PathVariable UUID userId) {
        return billPaymentService.history(userId);
    }
}
