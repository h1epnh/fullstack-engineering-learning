package com.ewalletlab.walletservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Issue #12 — "Ví Gia Đình" (VNPay-inspired, NOT MoMo — see backend DESIGN.md). Operator's decision
 * (ii) on issue #12: family spending limits are enforced directly inside wallet-service's own debit
 * path (not by every caller service pre-checking), which means wallet-service needs to know how to
 * ask family-wallet-service whether a given debiting user is a linked family member with a
 * parent-set {@code monthlyLimit}. This is the one place wallet-service is allowed to know that
 * "family" exists at all — see {@link WalletMutationExecutor#debitOnce} for the only caller.
 *
 * <p><b>Fail-open on infrastructure errors, not just "not a member" (404)</b>: a 404 here is the
 * overwhelmingly common case (most users aren't linked to any family) and correctly means "no
 * family limit applies". A connection failure/timeout/5xx from family-wallet-service is treated the
 * SAME way (limit not enforced this attempt) rather than blocking the debit — family-wallet-service
 * being briefly unavailable must not take down ordinary TRANSFER_OUT/BILL_PAYMENT/WITHDRAW for
 * every user in the system just because a small, optional add-on service is down. This is a
 * documented trade-off (see backend DESIGN.md's "Ví Gia Đình" section): it opens a small window
 * where a family member could exceed their limit specifically during a family-wallet-service
 * outage, accepted as reasonable for this lab's scale rather than making wallet-service's core
 * debit path hard-depend on an add-on service's uptime.
 */
@Component
class FamilyWalletServiceClient {

    private static final Logger log = LoggerFactory.getLogger(FamilyWalletServiceClient.class);

    private final RestClient restClient;

    FamilyWalletServiceClient(
        @Value("${ewallet-lab.family-wallet-service.base-url:http://localhost:8098}") String baseUrl) {
        this.restClient = RestClient.create(baseUrl);
    }

    record FamilyLimitResponse(UUID parentUserId, BigDecimal monthlyLimit) {
    }

    Optional<FamilyLimitResponse> findLimit(UUID memberUserId) {
        try {
            FamilyLimitResponse response = restClient.get()
                .uri("/family-wallets/members/{memberUserId}/limit", memberUserId)
                .retrieve()
                .body(FamilyLimitResponse.class);
            return Optional.ofNullable(response);
        } catch (HttpClientErrorException.NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            log.warn("family-wallet-service unreachable while checking family limit for user={} — " +
                "failing open (not enforcing a family limit this attempt): {}", memberUserId, e.toString());
            return Optional.empty();
        }
    }
}
