package com.ewalletlab.bnplservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class BnplServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BnplServiceApplication.class, args);
    }
}
