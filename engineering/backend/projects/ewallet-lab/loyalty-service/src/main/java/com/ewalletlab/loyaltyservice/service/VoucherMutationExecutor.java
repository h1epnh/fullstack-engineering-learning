package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.domain.Voucher;
import com.ewalletlab.loyaltyservice.domain.VoucherStatus;
import com.ewalletlab.loyaltyservice.repository.VoucherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Component
public class VoucherMutationExecutor {

    private final VoucherRepository voucherRepository;

    public VoucherMutationExecutor(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Transactional
    public Voucher claimVoucherAtomic(UUID voucherId, UUID userId, String billCategory, BigDecimal billAmount, UUID billId) {
        Voucher voucher = voucherRepository.findById(voucherId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy voucher"));

        if (!voucher.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Voucher không thuộc quyền sở hữu của bạn");
        }

        if (voucher.getStatus() != VoucherStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher đã được sử dụng hoặc không còn khả dụng");
        }

        if (voucher.getExpiresAt().isBefore(Instant.now())) {
            voucher.setStatus(VoucherStatus.EXPIRED);
            voucherRepository.save(voucher);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher đã hết hạn sử dụng");
        }

        if (billAmount != null && billAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Hoá đơn chưa đạt giá trị tối thiểu " + voucher.getMinOrderAmount() + "đ để áp dụng voucher này");
        }

        if (voucher.getApplicableCategory() != null && !voucher.getApplicableCategory().isBlank()
            && !"ALL".equalsIgnoreCase(voucher.getApplicableCategory())) {
            boolean matches = false;
            String appCat = voucher.getApplicableCategory();
            if (billCategory != null) {
                if (appCat.equalsIgnoreCase(billCategory)) {
                    matches = true;
                } else if ("ELECTRICITY_WATER".equalsIgnoreCase(appCat)
                    && ("ELECTRICITY".equalsIgnoreCase(billCategory) || "WATER".equalsIgnoreCase(billCategory))) {
                    matches = true;
                }
            }
            if (!matches) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Voucher này không áp dụng cho danh mục hoá đơn " + billCategory);
            }
        }

        voucher.setStatus(VoucherStatus.USED);
        voucher.setUsedAt(Instant.now());
        voucher.setUsedBillId(billId);

        return voucherRepository.save(voucher);
    }

    @Transactional
    public void revertVoucherAtomic(UUID voucherId, UUID userId) {
        voucherRepository.findById(voucherId).ifPresent(voucher -> {
            if (voucher.getUserId().equals(userId) && voucher.getStatus() == VoucherStatus.USED) {
                voucher.setStatus(VoucherStatus.AVAILABLE);
                voucher.setUsedAt(null);
                voucher.setUsedBillId(null);
                voucherRepository.save(voucher);
            }
        });
    }
}

