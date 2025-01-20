package com.example.DDDSample;

import com.example.DDDSample.application.configuration.RateLimitConfig;
import com.example.DDDSample.domain.service.security.ThrottlingFilter;
import io.github.bucket4j.Bucket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;

import java.time.Duration;


@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class DddSampleApplication  extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(DddSampleApplication.class, args);
	}

	@Bean
	public FilterRegistrationBean<ThrottlingFilter> throttlingFilterRegistrationBean() {
		FilterRegistrationBean<ThrottlingFilter> registration = new FilterRegistrationBean<>();
		ThrottlingFilter throttlingFilter = new ThrottlingFilter(RateLimitConfig.bucket());
		registration.setFilter(throttlingFilter);
		registration.addUrlPatterns("/*");
		return registration;
	}

}
