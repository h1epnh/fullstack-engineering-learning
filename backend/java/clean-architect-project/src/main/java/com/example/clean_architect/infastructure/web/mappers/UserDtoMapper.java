package com.example.clean_architect.infastructure.web.mappers;

import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.infastructure.web.dtos.UserRequest;
import com.example.clean_architect.infastructure.web.dtos.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserDtoMapper {

    public User toDomain(UserRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        return user;
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
