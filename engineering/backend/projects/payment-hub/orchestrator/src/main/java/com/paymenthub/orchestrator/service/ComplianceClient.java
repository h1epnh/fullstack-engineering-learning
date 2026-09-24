package com.paymenthub.orchestrator.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Calls the standalone compliance-service over HTTP for sanctions/AML screening — see DESIGN.md
 * section 3, step 3: this MUST run before routing, never after.
 *
 * Fails closed: if compliance-service is unreachable, the transaction is treated as NOT clear
 * rather than silently let through. For a real bank this would need a more nuanced degraded-mode
 * policy (e.g. queue for manual review) — fail-closed-and-reject is the simplest safe default for
 * a lab.
 */
@Component
public class ComplianceClient {

    private static final Logger log = LoggerFactory.getLogger(ComplianceClient.class);

    private final RestClient restClient;

    public ComplianceClient(@Value("${payment-hub.compliance.base-url}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    public boolean isClear(String sourceAccount, String destAccount) {
        try {
            ScreeningResult result = restClient.post()
                .uri("/screen")
                .body(Map.of("sourceAccount", sourceAccount, "destAccount", destAccount))
                .retrieve()
                .body(ScreeningResult.class);
            return result != null && result.clear();
        } catch (Exception e) {
            log.error("compliance-service call failed, failing closed (treating as not clear)", e);
            return false;
        }
    }

    private record ScreeningResult(boolean clear, String reason) {
    }
}
