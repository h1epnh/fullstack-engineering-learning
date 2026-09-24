package com.ewalletlab.userservice.web.dto;

import com.ewalletlab.userservice.domain.User;

import java.util.UUID;

public record UserResponse(UUID id, String phone, String name) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getPhone(), user.getName());
    }
}
