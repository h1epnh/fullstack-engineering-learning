package com.ewalletlab.loyaltyservice.service;

import com.ewalletlab.loyaltyservice.domain.*;
import com.ewalletlab.loyaltyservice.repository.VoucherPassPurchaseRepository;
import com.ewalletlab.loyaltyservice.repository.VoucherRepository;
import com.ewalletlab.loyaltyservice.web.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class VoucherPassService {

    private static final Logger log = LoggerFactory.getLogger(VoucherPassService.class);

    private final VoucherPassPurchaseRepository passPurchaseRepository;
    private final VoucherRepository voucherRepository;
    private final VoucherMutationExecutor mutationExecutor;
    private final WalletServiceClient walletServiceClient;

    public VoucherPassService(VoucherPassPurchaseRepository passPurchaseRepository,
                              VoucherRepository voucherRepository,
                              VoucherMutationExecutor mutationExecutor,
                              WalletServiceClient walletServiceClient) {
        this.passPurchaseRepository = passPurchaseRepository;
        this.voucherRepository = voucherRepository;
        this.mutationExecutor = mutationExecutor;
        this.walletServiceClient = walletServiceClient;
    }

    public List<PassPackageDefinition> getCatalog() {
        return VoucherPassCatalog.PACKAGES;
    }

    @Transactional
    public VoucherPassPurchaseDto purchasePass(PurchasePassRequestDto request) {
        PassPackageDefinition pkg = VoucherPassCatalog.findByCode(request.passCode())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói voucher pass: " + request.passCode()));

        UUID purchaseId = UUID.randomUUID();

        // 1. Debit ví chính với TransactionType VOUCHER_PASS_PURCHASE
        try {
            walletServiceClient.debitVoucherPass(request.userId(), pkg.price(), purchaseId, pkg.name());
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư ví chính không đủ để mua gói " + pkg.name());
            }
            if (e.getStatusCode().value() == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), e.getResponseBodyAsString());
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trừ tiền ví chính: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể kết nối ví chính: " + e.getMessage());
        }

        // 2. Lưu bản ghi mua gói
        Instant expiresAt = Instant.now().plus(pkg.validDays(), ChronoUnit.DAYS);
        VoucherPassPurchase purchase = new VoucherPassPurchase(
            request.userId(), pkg.code(), pkg.name(), pkg.price(), expiresAt
        );
        VoucherPassPurchase savedPurchase = passPurchaseRepository.save(purchase);

        // 3. Sinh các voucher thuộc gói
        List<Voucher> vouchers = new ArrayList<>();
        for (VoucherTemplate tpl : pkg.voucherTemplates()) {
            String shortCode = "VP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            vouchers.add(new Voucher(
                request.userId(),
                savedPurchase.getId(),
                shortCode,
                tpl.title(),
                tpl.description(),
                tpl.discountAmount(),
                tpl.minOrderAmount(),
                tpl.applicableCategory(),
                expiresAt
            ));
        }
        List<Voucher> savedVouchers = voucherRepository.saveAll(vouchers);

        List<VoucherDto> voucherDtos = savedVouchers.stream().map(VoucherDto::from).toList();
        return VoucherPassPurchaseDto.from(savedPurchase, voucherDtos);
    }

    public List<VoucherPassPurchaseDto> getMyPurchases(UUID userId) {
        List<VoucherPassPurchase> purchases = passPurchaseRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return purchases.stream().map(p -> {
            List<VoucherDto> vouchers = voucherRepository.findByPassPurchaseId(p.getId())
                .stream().map(VoucherDto::from).toList();
            return VoucherPassPurchaseDto.from(p, vouchers);
        }).toList();
    }

    public List<VoucherDto> getMyVouchers(UUID userId, VoucherStatus status) {
        List<Voucher> list = (status != null)
            ? voucherRepository.findByUserIdAndStatusOrderByExpiresAtAsc(userId, status)
            : voucherRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return list.stream().map(VoucherDto::from).toList();
    }

    public List<VoucherDto> getUsableVouchers(UUID userId, String billCategory, BigDecimal billAmount) {
        Instant now = Instant.now();
        List<Voucher> available = voucherRepository.findByUserIdAndStatusOrderByExpiresAtAsc(userId, VoucherStatus.AVAILABLE);

        return available.stream()
            .filter(v -> v.getExpiresAt().isAfter(now))
            .filter(v -> billAmount == null || billAmount.compareTo(v.getMinOrderAmount()) >= 0)
            .filter(v -> {
                if (v.getApplicableCategory() == null || v.getApplicableCategory().isBlank() || "ALL".equalsIgnoreCase(v.getApplicableCategory())) {
                    return true;
                }
                if (billCategory == null) return false;
                if (v.getApplicableCategory().equalsIgnoreCase(billCategory)) return true;
                if ("ELECTRICITY_WATER".equalsIgnoreCase(v.getApplicableCategory())
                    && ("ELECTRICITY".equalsIgnoreCase(billCategory) || "WATER".equalsIgnoreCase(billCategory))) {
                    return true;
                }
                return false;
            })
            .map(VoucherDto::from)
            .toList();
    }

    public ClaimVoucherResultDto claimVoucher(UUID voucherId, ClaimVoucherRequestDto req) {
        try {
            Voucher voucher = mutationExecutor.claimVoucherAtomic(
                voucherId, req.userId(), req.billCategory(), req.billAmount(), req.billId()
            );
            return new ClaimVoucherResultDto(voucher.getId(), voucher.getCode(), voucher.getTitle(), voucher.getDiscountAmount());
        } catch (ObjectOptimisticLockingFailureException e) {
            log.warn("Concurrent claim on voucher {} for user {}", voucherId, req.userId());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Voucher đang được xử lý trong giao dịch khác");
        }
    }

    public void revertVoucher(UUID voucherId, RevertVoucherRequestDto req) {
        mutationExecutor.revertVoucherAtomic(voucherId, req.userId());
    }
}

