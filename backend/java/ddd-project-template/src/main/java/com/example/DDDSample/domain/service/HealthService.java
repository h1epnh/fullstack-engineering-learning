package com.example.DDDSample.domain.service;

import com.example.DDDSample.infastructure.repository.database.HealthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    @Autowired
    private HealthRepository healthRepository;

    public boolean isJpaWorking() {
        return healthRepository.count() > 0;
    }
}
