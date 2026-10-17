package com.ewalletlab.userservice.web;

import com.ewalletlab.userservice.domain.User;
import com.ewalletlab.userservice.domain.WebauthnCredential;
import com.ewalletlab.userservice.repository.UserRepository;
import com.ewalletlab.userservice.repository.WebauthnCredentialRepository;
import com.ewalletlab.userservice.web.dto.RegisterRequest;
import com.ewalletlab.userservice.web.dto.RegisterWebauthnCredentialRequest;
import com.ewalletlab.userservice.web.dto.UserResponse;
import com.ewalletlab.userservice.web.dto.WebauthnStatusResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * No real auth/OTP here — this is a lab. A real e-wallet's KYC/registration flow is far heavier
 * (see BUSINESS.md in payment-hub for the biometric/CCCD verification requirements that apply to
 * real e-wallets in Vietnam under Circular 41/2025/TT-NHNN — deliberately out of scope here).
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final WebauthnCredentialRepository webauthnCredentialRepository;

    public UserController(UserRepository userRepository, WebauthnCredentialRepository webauthnCredentialRepository) {
        this.userRepository = userRepository;
        this.webauthnCredentialRepository = webauthnCredentialRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
        }
        User saved = userRepository.save(new User(request.phone(), request.name()));
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse.from(saved));
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable UUID id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
    }

    /** Used by transfer-service to resolve a recipient's phone number to a user id. */
    @GetMapping("/by-phone/{phone}")
    public UserResponse getByPhone(@PathVariable String phone) {
        return userRepository.findByPhone(phone)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user with phone: " + phone));
    }

    public record VerifyKycRequest(
        @jakarta.validation.constraints.NotBlank(message = "Số CCCD không được để trống")
        String idCardNumber
    ) {}

    /**
     * Issue #40: Định danh tài khoản eKYC mô phỏng (cập nhật kycTier thành VERIFIED và lưu CCCD).
     */
    @PostMapping("/{id}/verify-kyc")
    public ResponseEntity<UserResponse> verifyKyc(
        @PathVariable UUID id,
        @Valid @RequestBody VerifyKycRequest request
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        user.verifyKyc(request.idCardNumber());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(UserResponse.from(saved));
    }

    /**
     * Issue #41 — register a platform authenticator (Touch ID/Face ID) credential id for this
     * user, 1 row per device. NOT a full FIDO2 server-side verification — see
     * {@code WebauthnCredential}'s class comment for exactly what is/isn't checked here.
     */
    @PostMapping("/{id}/webauthn/credentials")
    public ResponseEntity<Void> registerWebauthnCredential(
        @PathVariable UUID id,
        @Valid @RequestBody RegisterWebauthnCredentialRequest request
    ) {
        userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + id));
        if (webauthnCredentialRepository.findByCredentialId(request.credentialId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Credential này đã được đăng ký trước đó");
        }
        webauthnCredentialRepository.save(
            new WebauthnCredential(id, request.credentialId(), request.publicKey(), request.deviceLabel())
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /** Issue #41 — whether this user has registered a platform authenticator on any device. */
    @GetMapping("/{id}/webauthn/credentials")
    public WebauthnStatusResponse webauthnStatus(@PathVariable UUID id) {
        long count = webauthnCredentialRepository.countByUserId(id);
        return new WebauthnStatusResponse(count > 0, (int) count);
    }
}
