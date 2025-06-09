package com.example.atg_jwt_generator.application.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@org.springframework.context.annotation.Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/v1/token", "/v1/encrypted-card-info").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.disable());
        return http.build();
    }
}
