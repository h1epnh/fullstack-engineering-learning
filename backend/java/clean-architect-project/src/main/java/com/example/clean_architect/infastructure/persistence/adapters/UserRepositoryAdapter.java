package com.example.clean_architect.infastructure.persistence.adapters;

import com.example.clean_architect.application.ports.output.UserRepository;
import com.example.clean_architect.domain.entities.User;
import com.example.clean_architect.infastructure.persistence.jpa.entities.UserEntity;
import com.example.clean_architect.infastructure.persistence.jpa.repositories.UserJpaRepository;
import com.example.clean_architect.infastructure.persistence.mappers.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpaRepository;
    private final UserMapper userMapper;

    @Autowired
    public UserRepositoryAdapter(UserJpaRepository jpaRepository, UserMapper userMapper) {
        this.jpaRepository = jpaRepository;
        this.userMapper = userMapper;
    }

    @Override
    public User save(User user) {
        UserEntity entity = userMapper.toEntity(user);
        UserEntity savedEntity = jpaRepository.save(entity);
        return userMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<User> findById(Long id) {
        return jpaRepository.findById(id)
                .map(userMapper::toDomain);
    }
}