package com.ewalletlab.topupservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Optional;
import java.util.UUID;

/**
 * Issue #39: Client to query merchant information from user-service.
 */
@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);
    private final RestClient restClient;

    public UserServiceClient(@Value("${ewallet-lab.user-service.base-url}") String userServiceBaseUrl) {
        this.restClient = RestClient.create(userServiceBaseUrl);
    }

    public record MerchantDto(UUID id, UUID userId, String merchantName, String businessCategory, String merchantQrCode) {
    }

    public Optional<MerchantDto> getMerchantByUserId(UUID userId) {
        try {
            MerchantDto merchant = restClient.get()
                .uri("/merchants/by-user/{userId}", userId)
                .retrieve()
                .body(MerchantDto.class);
            return Optional.ofNullable(merchant);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Failed to reach user-service to check merchant status for user {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }
}
