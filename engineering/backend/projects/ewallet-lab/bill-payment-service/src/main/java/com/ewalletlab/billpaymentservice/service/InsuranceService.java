package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.InsurancePolicy;
import com.ewalletlab.billpaymentservice.domain.PolicyStatus;
import com.ewalletlab.billpaymentservice.repository.InsurancePolicyRepository;
import com.ewalletlab.billpaymentservice.web.dto.BuyPolicyRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.InsurancePolicyDto;
import com.ewalletlab.billpaymentservice.web.dto.InsuranceProductDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InsuranceService {

    private final InsurancePolicyRepository repository;
    private final WalletServiceClient walletServiceClient;
    private final SecureRandom random = new SecureRandom();

    private static final List<InsuranceProductDto> PRODUCTS = List.of(
        new InsuranceProductDto(
            "MOTORCYCLE_TNDS",
            "Bảo hiểm bắt buộc TNDS xe máy",
            "Bảo hiểm trách nhiệm dân sự bắt buộc của chủ xe môtô, xe gắn máy đối với bên thứ ba theo quy định Nhà nước.",
            new BigDecimal("66000"),
            new BigDecimal("150000000"),
            365,
            "12 tháng",
            true
        ),
        new InsuranceProductDto(
            "PERSONAL_ACCIDENT_BASIC",
            "Bảo hiểm tai nạn cá nhân cơ bản",
            "Bảo vệ tài chính trước các rủi ro tai nạn, thương tật 24/7 với quyền lợi bảo hiểm tối đa đến 20 triệu đồng.",
            new BigDecimal("30000"),
            new BigDecimal("20000000"),
            30,
            "30 ngày",
            false
        )
    );

    private static final Map<String, String> PRODUCT_NAMES = Map.of(
        "MOTORCYCLE_TNDS", "Bảo hiểm bắt buộc TNDS xe máy",
        "PERSONAL_ACCIDENT_BASIC", "Bảo hiểm tai nạn cá nhân cơ bản"
    );

    public InsuranceService(InsurancePolicyRepository repository, WalletServiceClient walletServiceClient) {
        this.repository = repository;
        this.walletServiceClient = walletServiceClient;
    }

    public List<InsuranceProductDto> getProducts() {
        return PRODUCTS;
    }

    public InsuranceProductDto getProduct(String code) {
        return PRODUCTS.stream()
            .filter(p -> p.productCode().equalsIgnoreCase(code))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gói bảo hiểm: " + code));
    }

    @Transactional
    public InsurancePolicyDto buyPolicy(BuyPolicyRequestDto request) {
        InsuranceProductDto product = getProduct(request.productCode());

        if (product.requiresVehiclePlate() && (request.vehiclePlate() == null || request.vehiclePlate().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói bảo hiểm xe máy bắt buộc phải cung cấp biển số xe");
        }

        LocalDate effectiveDate = LocalDate.now();
        LocalDate expiryDate = product.productCode().equalsIgnoreCase("MOTORCYCLE_TNDS")
            ? effectiveDate.plusYears(1)
            : effectiveDate.plusDays(product.durationDays());

        String prefix = product.productCode().equalsIgnoreCase("MOTORCYCLE_TNDS") ? "BH-XM" : "BH-TN";
        String certificateNumber = prefix + "-" + effectiveDate.getYear() + "-" + (10000 + random.nextInt(90000));

        // Debit wallet
        try {
            walletServiceClient.debit(
                request.userId(),
                product.premiumAmount(),
                certificateNumber,
                "Mua bảo hiểm " + product.name() + " (" + certificateNumber + ")",
                false
            );
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư ví không đủ để thanh toán bảo hiểm");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trừ tiền ví: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể kết nối wallet-service: " + e.getMessage());
        }

        InsurancePolicy policy = new InsurancePolicy(
            UUID.randomUUID(),
            request.userId(),
            product.productCode(),
            request.insuredName().trim(),
            request.insuredIdCard().trim(),
            request.vehiclePlate() != null ? request.vehiclePlate().trim().toUpperCase() : null,
            product.premiumAmount(),
            product.coverageAmount(),
            effectiveDate,
            expiryDate,
            certificateNumber,
            PolicyStatus.ACTIVE
        );

        InsurancePolicy saved = repository.save(policy);
        return InsurancePolicyDto.from(saved, product.name());
    }

    public List<InsurancePolicyDto> getPolicies(UUID userId) {
        List<InsurancePolicy> list = repository.findByUserIdOrderByCreatedAtDesc(userId);
        return list.stream()
            .map(p -> InsurancePolicyDto.from(p, PRODUCT_NAMES.getOrDefault(p.getProductCode(), p.getProductCode())))
            .toList();
    }

    public InsurancePolicyDto getCertificate(UUID id) {
        InsurancePolicy policy = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy hợp đồng bảo hiểm"));
        return InsurancePolicyDto.from(policy, PRODUCT_NAMES.getOrDefault(policy.getProductCode(), policy.getProductCode()));
    }
}
