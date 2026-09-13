package com.example.clean_architect.infastructure.web.controllers;

import com.example.clean_architect.application.ports.input.UserUseCase;
import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.infastructure.web.dtos.UserRequest;
import com.example.clean_architect.infastructure.web.dtos.UserResponse;
import com.example.clean_architect.infastructure.web.mappers.UserDtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserUseCase userUseCase;
    private final UserDtoMapper userDtoMapper;

    @Autowired
    public UserController(UserUseCase userUseCase, UserDtoMapper userDtoMapper) {
        this.userUseCase = userUseCase;
        this.userDtoMapper = userDtoMapper;
    }


    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest userRequest) {
        User user = userDtoMapper.toDomain(userRequest);
        User createdUser = userUseCase.createUser(user);
        return new ResponseEntity<>(userDtoMapper.toResponse(createdUser), HttpStatus.CREATED);
    }


    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userUseCase.getUserById(id);
        return ResponseEntity.ok(userDtoMapper.toResponse(user));
    }
}
