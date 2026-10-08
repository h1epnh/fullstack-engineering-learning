package com.ewalletlab.loyaltyservice.web;

import com.ewalletlab.loyaltyservice.domain.PassPackageDefinition;
import com.ewalletlab.loyaltyservice.domain.VoucherStatus;
import com.ewalletlab.loyaltyservice.service.VoucherPassService;
import com.ewalletlab.loyaltyservice.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/loyalty")
public class VoucherPassController {

    private final VoucherPassService voucherPassService;

    public VoucherPassController(VoucherPassService voucherPassService) {
        this.voucherPassService = voucherPassService;
    }

    @GetMapping("/vouchers/disclaimer")
    public Map<String, String> getDisclaimer() {
        return Map.of(
            "title", "Gói Voucher Pass mô phỏng",
            "disclaimer", "Gói Voucher Pass và voucher giảm giá là tính năng mô phỏng cho mục đích học tập trong Ewallet Lab. Không có nhãn hàng hay đối tác thương mại thật đứng sau."
        );
    }

    @GetMapping("/voucher-passes")
    public List<PassPackageDefinition> getCatalog() {
        return voucherPassService.getCatalog();
    }

    @PostMapping("/voucher-passes/purchase")
    @ResponseStatus(HttpStatus.CREATED)
    public VoucherPassPurchaseDto purchasePass(@Valid @RequestBody PurchasePassRequestDto request) {
        return voucherPassService.purchasePass(request);
    }

    @GetMapping("/voucher-passes/my")
    public List<VoucherPassPurchaseDto> getMyPurchases(@RequestParam("userId") UUID userId) {
        return voucherPassService.getMyPurchases(userId);
    }

    @GetMapping("/vouchers/my")
    public List<VoucherDto> getMyVouchers(@RequestParam("userId") UUID userId,
                                         @RequestParam(value = "status", required = false) VoucherStatus status) {
        return voucherPassService.getMyVouchers(userId, status);
    }

    @GetMapping("/vouchers/usable")
    public List<VoucherDto> getUsableVouchers(@RequestParam("userId") UUID userId,
                                             @RequestParam(value = "category", required = false) String category,
                                             @RequestParam(value = "amount", required = false) BigDecimal amount) {
        return voucherPassService.getUsableVouchers(userId, category, amount);
    }

    @PostMapping("/vouchers/{id}/claim")
    public ClaimVoucherResultDto claimVoucher(@PathVariable("id") UUID id,
                                             @Valid @RequestBody ClaimVoucherRequestDto request) {
        return voucherPassService.claimVoucher(id, request);
    }

    @PostMapping("/vouchers/{id}/revert")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revertVoucher(@PathVariable("id") UUID id,
                             @Valid @RequestBody RevertVoucherRequestDto request) {
        voucherPassService.revertVoucher(id, request);
    }

    /** Cùng pattern đã dùng ở BillPaymentController/FundController/... — không có handler này,
     * ResponseStatusException's reason bị Spring Boot 3 bọc vào ProblemDetail JSON thay vì trả
     * đúng message Tiếng Việt thô mà frontend (packages/api-client/http.ts) đang đọc qua
     * res.text() để hiện verbatim (vd. "Số dư ví chính không đủ để mua gói ..."). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }
}

