package com.example.DDDSample.application.controller;

import com.example.DDDSample.domain.service.HealthService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldController {

    private final HealthService healthService;

    public HelloWorldController(HealthService healthService) {
        this.healthService = healthService;
    }


    @RequestMapping("/")
    public String helloWorld() {
        return "Hello World!";
    }

    @RequestMapping("/health")
    public String health() {
        return "Health: " + healthService.isJpaWorking();
    }
}