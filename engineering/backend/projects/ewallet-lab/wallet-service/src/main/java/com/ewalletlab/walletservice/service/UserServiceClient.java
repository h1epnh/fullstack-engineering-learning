package com.ewalletlab.walletservice.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Issue #40 — eKYC tier check; issue #55 (TD-08, ADR-02, operator decision on #40) — FAIL-CLOSED for
 * money-OUT. Three distinct outcomes (no longer collapsed into one {@code Optional.empty()}):
 * <ul>
 *   <li>found: {@code Optional.of(user)} with {@code kycTier};</li>
 *   <li>not found (HTTP 404): {@code Optional.empty()} — the caller rejects money-OUT;</li>
 *   <li>unknown (timeout / 5xx / connection error): throws {@link KycUnavailableException} — the
 *       caller's debit is rejected (HTTP 503), nothing is changed.</li>
 * </ul>
 * Connect/read timeouts are explicit and configurable so an unreachable user-service is detected
 * instead of hanging a request thread.
 */
@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;
    private final Counter blockedCounter;

    @Autowired
    public UserServiceClient(
        @Value("${ewallet-lab.user-service.base-url:http://localhost:8090}") String baseUrl,
        @Value("${ewallet-lab.user-service.connect-timeout-ms:1000}") int connectTimeoutMs,
        @Value("${ewallet-lab.user-service.read-timeout-ms:2000}") int readTimeoutMs,
        MeterRegistry meterRegistry) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        factory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.blockedCounter = meterRegistry.counter("wallet.kyc.check.unavailable");
    }

    public record UserResponse(UUID id, String phone, String name, String kycTier, String idCardNumber) {
    }

    /** @throws KycUnavailableException if the tier cannot be determined (not for 404). */
    public Optional<UserResponse> findUser(UUID userId) {

        try {
            UserResponse response = restClient.get()
                .uri("/users/{id}", userId)
                .retrieve()
                .body(UserResponse.class);
            return Optional.ofNullable(response);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            blockedCounter.increment();
            log.warn("KYC_CHECK_UNAVAILABLE user={} — user-service unreachable/erroring, money-OUT debit will be rejected (fail-closed): {}",
                userId, e.toString());
            throw new KycUnavailableException(
                "Không thể xác minh định danh lúc này, vui lòng thử lại sau", e);
        }
    }
}
