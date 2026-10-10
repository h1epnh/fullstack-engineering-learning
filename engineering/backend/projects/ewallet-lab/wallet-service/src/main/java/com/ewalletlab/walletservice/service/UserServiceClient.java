package com.ewalletlab.walletservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Optional;
import java.util.UUID;

/**
 * Issue #40 — eKYC tier limit check.
 * Calls user-service /users/{id} to check kycTier.
 * Fail-open policy: if user-service is unreachable or user not found (e.g. test fixture),
 * default to VERIFIED (no downgrade) to prevent blocking normal transactions.
 */
@Component
class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;

    UserServiceClient(
        @Value("${ewallet-lab.user-service.base-url:http://localhost:8090}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    record UserResponse(UUID id, String phone, String name, String kycTier, String idCardNumber) {
    }

    Optional<UserResponse> findUser(UUID userId) {
        try {
            UserResponse response = restClient.get()
                .uri("/users/{id}", userId)
                .retrieve()
                .body(UserResponse.class);
            return Optional.ofNullable(response);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            log.warn("user-service unreachable while checking kyc tier for user={} — failing open: {}", userId, e.toString());
            return Optional.empty();
        }
    }
}
