package com.example.clean_architect.infastructure.persistence.jpa.repositories;

import com.example.clean_architect.infastructure.persistence.jpa.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {

}