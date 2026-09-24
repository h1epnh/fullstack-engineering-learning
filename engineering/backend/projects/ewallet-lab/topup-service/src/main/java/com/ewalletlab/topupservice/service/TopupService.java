package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class TopupService {

    private final TopupRequestRepository topupRequestRepository;
    private final BankGatewayClient bankGatewayClient;

    public TopupService(TopupRequestRepository topupRequestRepository, BankGatewayClient bankGatewayClient) {
        this.topupRequestRepository = topupRequestRepository;
        this.bankGatewayClient = bankGatewayClient;
    }

    /**
     * Returns as soon as mock-bank-gateway ACKs the create call (step 3 in DESIGN.md) — this is
     * NOT confirmation the wallet was credited. The caller (e.g. the frontend) should poll
     * GET /topups/{orderId} or wait for its own notification, not assume success from this call
     * returning 200.
     */
    public TopupRequest initiate(UUID userId, BigDecimal amount) {
        String orderId = "topup-" + UUID.randomUUID();
        TopupRequest topupRequest = topupRequestRepository.save(new TopupRequest(orderId, userId, amount));

        CollectionResponse response = bankGatewayClient.createCollection(orderId, amount);
        if (response.resultCode() != 0) {
            topupRequest.markStatus(TopupStatus.FAILED);
            topupRequestRepository.save(topupRequest);
        }
        // resultCode == 0 here just means "request accepted", not "money moved" — status stays
        // PENDING until the IPN callback arrives (see IpnController).
        return topupRequest;
    }
}
