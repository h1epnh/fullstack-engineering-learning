package com.example.DDDSample.domain.service.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ThrottlingFilter extends OncePerRequestFilter {
    private final Bucket bucket;


    public ThrottlingFilter(@Autowired Bucket bucket) {
        this.bucket = bucket;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Extract user ID or IP address for identification (replace with your logic)
        String identifier = request.getHeader("X-User-Id");
        if (identifier == null) {
            identifier = request.getRemoteAddr();
        }

        // Try to consume a token for the identified user
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Request allowed, proceed with the filter chain
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            // Request rejected due to rate limit
            response.setStatus(429); // Too Many Requests
            response.setHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
            response.getWriter().write("Too many requests. Please try again later.");
        }
    }
}
