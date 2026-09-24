package com.ewalletlab.walletservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Lab-only permissive CORS: defaults to the microfrontend shell/remotes running on
 * localhost:5173-5179 in dev, overridable via ALLOWED_ORIGIN_PATTERN (e.g. the in-cluster
 * Ingress host pattern when deployed to Kubernetes). Not hardened for production (no
 * credentialed origins allow-list, no per-environment config beyond this one pattern).
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
