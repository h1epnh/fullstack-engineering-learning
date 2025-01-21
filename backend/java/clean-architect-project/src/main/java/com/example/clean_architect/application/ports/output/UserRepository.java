package com.example.clean_architect.application.ports.output;


import com.example.clean_architect.domain.entities.User;

import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(Long id);
}