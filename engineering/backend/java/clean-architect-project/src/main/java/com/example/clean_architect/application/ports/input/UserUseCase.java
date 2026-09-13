package com.example.clean_architect.application.ports.input;

import com.example.clean_architect.domain.entities.User;

public interface UserUseCase {
    User createUser(User user);
    User getUserById(Long id);
}