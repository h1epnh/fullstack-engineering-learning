package com.ewalletlab.luckymoneyservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Same lab-only permissive CORS pattern as every other service — see bill-payment-service's
 * CorsConfig.java. Overridable via ALLOWED_ORIGIN_PATTERN (Helm sets it to the Ingress host
 * pattern) — don't hardcode the localhost default when deploying. */
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
