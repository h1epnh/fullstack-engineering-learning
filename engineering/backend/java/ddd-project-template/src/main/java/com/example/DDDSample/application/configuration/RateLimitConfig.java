package com.example.DDDSample.application.configuration;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.Getter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@Getter
public class RateLimitConfig {

    @Bean
    public static Bucket bucket() {
        // bucket with capacity 20 tokens and with refilling speed 1 token per each 6 second
        return Bucket.builder()
                .addLimit(limit -> limit.capacity(10).refillGreedy(10, Duration.ofMinutes(1)))
                .build();
    }



}
