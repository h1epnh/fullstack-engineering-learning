package com.example.clean_architect.application.impl;

import com.example.clean_architect.application.ports.output.UserRepository;
import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.domain.exceptions.UserNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserUseCaseImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserUseCaseImpl userUseCase;

    @Test
    public void createUser() {
        User user = new User("name", "email");
        when(userRepository.save(user)).thenReturn(new User(1L,"name", "email"));
        User createdUser = userUseCase.createUser(user);
        assertEquals(1L, createdUser.getId());
        assertEquals("name", createdUser.getName());
        assertEquals("email", createdUser.getEmail());
    }

    @Test
    void getUserById_returnsUser() {
        String username = "testuser";
        User user = new User(1L, username, "password");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        User foundUser = userUseCase.getUserById(1L);
        assertEquals(username, foundUser.getName());
    }

    @Test
    void getUserByUsername_nonExistingUser_throwsUserNotFoundException() {
        String username = "nonexistent";
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> userUseCase.getUserById(1L));
    }
}
