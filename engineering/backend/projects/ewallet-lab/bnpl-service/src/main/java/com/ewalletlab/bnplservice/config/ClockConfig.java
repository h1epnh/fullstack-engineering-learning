package com.ewalletlab.bnplservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.Duration;

/**
 * Every "now" in this service goes through this Clock, so {@code BNPL_CLOCK_OFFSET_DAYS} can move
 * the whole service into the future in one place (test-only; see application.yml).
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock bnplClock(BnplProperties props) {
        Clock base = Clock.system(props.zone());
        return props.clockOffsetDays() == 0 ? base : Clock.offset(base, Duration.ofDays(props.clockOffsetDays()));
    }
}
