package com.ewalletlab.fundservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** {@code @EnableScheduling} — issue #22's {@code FundOutboxRelay} background job (polls {@code
 * outbox_event} for PENDING rows every 10s and actually calls wallet-service; see its javadoc).
 * Previously backed issue #14's {@code FundCompensationReconciler}, removed when #22's outbox
 * pattern superseded that whole mechanism. */
@SpringBootApplication
@EnableScheduling
public class FundServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FundServiceApplication.class, args);
    }
}
