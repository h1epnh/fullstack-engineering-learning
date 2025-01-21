package com.example.clean_architect.application.impl;

import com.example.clean_architect.application.ports.input.UserUseCase;
import com.example.clean_architect.application.ports.output.UserRepository;
import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.domain.exceptions.UserNotFoundException;
import org.springframework.stereotype.Service;

import org.springframework.beans.factory.annotation.Autowired;

@Service
public class UserUseCaseImpl implements UserUseCase {

    private final UserRepository userRepository;

    @Autowired
    public UserUseCaseImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
    }
}