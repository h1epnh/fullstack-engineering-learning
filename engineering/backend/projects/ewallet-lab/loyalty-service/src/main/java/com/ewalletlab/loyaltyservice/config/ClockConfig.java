package com.ewalletlab.loyaltyservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class ClockConfig {

    @Bean
    public Clock loyaltyClock(LoyaltyProperties props) {
        return Clock.system(props.zone());
    }
}
