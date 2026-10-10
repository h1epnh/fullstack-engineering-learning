package com.ewalletlab.userservice.web;

import com.ewalletlab.userservice.domain.Merchant;
import com.ewalletlab.userservice.domain.User;
import com.ewalletlab.userservice.repository.MerchantRepository;
import com.ewalletlab.userservice.repository.UserRepository;
import com.ewalletlab.userservice.web.dto.MerchantResponse;
import com.ewalletlab.userservice.web.dto.RegisterMerchantRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * Issue #39: Quản lý tài khoản Merchant / Doanh nghiệp & QR Đa Năng thu hộ.
 * Mô phỏng phục vụ học tập, không có thẩm định merchant/KYC doanh nghiệp thật.
 */
@RestController
@RequestMapping("/merchants")
public class MerchantController {

    private final MerchantRepository merchantRepository;
    private final UserRepository userRepository;

    public MerchantController(MerchantRepository merchantRepository, UserRepository userRepository) {
        this.merchantRepository = merchantRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<MerchantResponse> register(@Valid @RequestBody RegisterMerchantRequest request) {
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + request.userId()));

        if (merchantRepository.existsByUserId(request.userId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Người dùng đã đăng ký tài khoản Merchant");
        }

        Merchant merchant = new Merchant(request.userId(), request.merchantName(), request.businessCategory(), "");
        Merchant saved = merchantRepository.save(merchant);

        String qrPayload = "ewalletlab://pay?merchant=" + saved.getId()
            + "&phone=" + user.getPhone()
            + "&name=" + URLEncoder.encode(request.merchantName(), StandardCharsets.UTF_8);
        saved.setMerchantQrCode(qrPayload);
        saved = merchantRepository.save(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(MerchantResponse.from(saved));
    }

    @GetMapping("/by-user/{userId}")
    public MerchantResponse getByUserId(@PathVariable UUID userId) {
        return merchantRepository.findByUserId(userId)
            .map(MerchantResponse::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Merchant cho user: " + userId));
    }

    @GetMapping("/{id}")
    public MerchantResponse getById(@PathVariable UUID id) {
        return merchantRepository.findById(id)
            .map(MerchantResponse::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Merchant not found: " + id));
    }
}
