package com.ewalletlab.userservice.web;

import com.ewalletlab.userservice.domain.User;
import com.ewalletlab.userservice.repository.UserRepository;
import com.ewalletlab.userservice.web.dto.RegisterRequest;
import com.ewalletlab.userservice.web.dto.UserResponse;
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

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
