package com.ewalletlab.paymentrequestservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

/** Calls user-service's /users/by-phone/{phone} — same lookup transfer-service already does for
 * P2P transfer, reused here to resolve a PaymentReminder's target user (issue #8). */
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
}
