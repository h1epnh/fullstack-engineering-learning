package com.ewalletlab.luckymoneyservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** {@code @EnableScheduling} — issue #56's {@code LuckyOutboxRelay} background job. */
@EnableScheduling
@SpringBootApplication
public class LuckyMoneyServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(LuckyMoneyServiceApplication.class, args);
    }
}
