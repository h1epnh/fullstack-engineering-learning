package com.ewalletlab.fundservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** {@code @EnableScheduling} — issue #14's {@code FundCompensationReconciler} background job
 * (retries a stuck withdraw/dissolve compensation that exhausted its own retry budget under
 * extreme contention; see its javadoc). */
@SpringBootApplication
@EnableScheduling
public class FundServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FundServiceApplication.class, args);
    }
}
