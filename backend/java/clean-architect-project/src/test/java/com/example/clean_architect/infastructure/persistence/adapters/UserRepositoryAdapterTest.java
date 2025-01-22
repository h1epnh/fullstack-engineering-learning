package com.example.clean_architect.infastructure.persistence.adapters;


import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.infastructure.persistence.jpa.entities.UserEntity;
import com.example.clean_architect.infastructure.persistence.jpa.repositories.UserJpaRepository;
import com.example.clean_architect.infastructure.persistence.mappers.UserMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserRepositoryAdapterTest {

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserRepositoryAdapter userRepositoryAdapter;

    @Test
    void save() {
        User user = new User("name", "email");
        UserEntity userJpaEntity = new UserEntity();
        userJpaEntity.setName(user.getName());
        userJpaEntity.setEmail(user.getEmail());

        UserEntity savedUserJpaEntity = new UserEntity();
        savedUserJpaEntity.setId(1L);
        savedUserJpaEntity.setName(user.getName());
        savedUserJpaEntity.setEmail(user.getEmail());

        when(userMapper.toEntity(user)).thenReturn(userJpaEntity);
        when(userJpaRepository.save(userJpaEntity)).thenReturn(savedUserJpaEntity);
        when(userMapper.toDomain(savedUserJpaEntity)).thenReturn(new User(1L,"testuser", "password"));

        User savedUser = userRepositoryAdapter.save(user);
        assertEquals(1L, savedUser.getId());
        assertEquals("testuser", savedUser.getName());
    }
}
