package com.example.DDDSample.infastructure.repository.database;

import com.example.DDDSample.infastructure.entity.Health;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthRepository extends JpaRepository<Health, Long> {
}
