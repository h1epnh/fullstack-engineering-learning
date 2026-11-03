package com.ewalletlab.topupservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TopupServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TopupServiceApplication.class, args);
    }
}
