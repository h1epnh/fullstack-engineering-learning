package com.ewalletlab.fundservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Same lab-only permissive CORS pattern as every other service in this project — see
 * bill-payment-service's CorsConfig for the full reasoning. Overridable via ALLOWED_ORIGIN_PATTERN
 * (Helm sets this to the in-cluster Ingress host pattern).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${ALLOWED_ORIGIN_PATTERN:http://localhost:*}")
    private String allowedOriginPattern;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOriginPatterns(allowedOriginPattern)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*");
    }
}
