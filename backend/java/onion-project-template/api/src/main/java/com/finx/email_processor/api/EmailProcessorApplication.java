package com.finx.email_processor.api;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;

@RequiredArgsConstructor
@EnableR2dbcRepositories("com.finx.email_processor.*.repository")
@SpringBootApplication(
        scanBasePackages = "com.finx.email_processor",
        exclude = SecurityAutoConfiguration.class)
public class EmailProcessorApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmailProcessorApplication.class, args);
    }
}
