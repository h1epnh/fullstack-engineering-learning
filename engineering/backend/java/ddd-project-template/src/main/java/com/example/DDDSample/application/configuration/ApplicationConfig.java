package com.example.DDDSample.application.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties
@ConfigurationProperties(prefix = "app")
@Setter
@Getter
public class ApplicationConfig {

    @Getter
    public static class Signature {

    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
