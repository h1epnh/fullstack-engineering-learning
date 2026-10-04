package com.ewalletlab.fundservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

/** Calls user-service's /users/by-phone/{phone} — same lookup already reused by
 * transfer-service/lucky-money-service/payment-request-service/family-wallet-service, used here to
 * resolve a member's userId from the phone number the creator enters (issue #14's Task step 2). */
@Component
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient(@Value("${ewallet-lab.user-service.base-url}") String userServiceBaseUrl) {
        this.restClient = RestClient.create(userServiceBaseUrl);
    }

    public record UserResponse(UUID id, String phone, String name) {
    }

    public UserResponse findByPhone(String phone) {
        return restClient.get()
            .uri("/users/by-phone/{phone}", phone)
            .retrieve()
            .body(UserResponse.class);
    }

    /** Used to denormalize the creator's own name/phone onto a {@code Fund} at creation time (the
     * creator is identified by id, not phone, since the frontend already has their own session's
     * userId — see FundService.create). */
    public UserResponse findById(UUID id) {
        return restClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .body(UserResponse.class);
    }
}
