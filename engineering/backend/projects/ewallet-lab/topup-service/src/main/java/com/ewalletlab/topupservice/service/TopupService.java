package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class TopupService {

    private final TopupRequestRepository topupRequestRepository;
    private final BankGatewayClient bankGatewayClient;
    private final WalletServiceClient walletServiceClient;

    public TopupService(TopupRequestRepository topupRequestRepository, BankGatewayClient bankGatewayClient,
                         WalletServiceClient walletServiceClient) {
        this.topupRequestRepository = topupRequestRepository;
        this.bankGatewayClient = bankGatewayClient;
        this.walletServiceClient = walletServiceClient;
    }

    /**
     * Returns as soon as mock-bank-gateway ACKs the create call (step 3 in DESIGN.md) — this is
     * NOT confirmation the wallet was credited. The caller (e.g. the frontend) should poll
     * GET /topups/{orderId} or wait for its own notification, not assume success from this call
     * returning 200.
     *
     * <p>Issue #15 — step-up gate for TOPUP runs HERE, synchronously, before any gateway call or
     * {@code TopupRequest} row is created (fail-fast, no orphan PENDING rows for a rejected
     * request) — unlike the other 3 step-up-scoped types, TOPUP's actual wallet credit happens
     * asynchronously later (once mock-bank-gateway's IPN lands, consumed via Kafka by
     * wallet-service's TopupConfirmedListener), so there's no HTTP caller present at that point to
     * carry a {@code stepUpConfirmed} flag — see WalletServiceClient.StepUpCheckResult's javadoc.
     */
    public TopupRequest initiate(UUID userId, BigDecimal amount, boolean stepUpConfirmed) {
        WalletServiceClient.StepUpCheckResult check = walletServiceClient.stepUpCheck(userId, amount);
        if (check.required() && !stepUpConfirmed) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED, describeStepUpRequirement(check));
        }

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

    /** Same Vietnamese copy as StepUpPolicy.describeRequirement() on wallet-service, built from the
     * thresholds the check response actually returned rather than a second hardcoded copy of the
     * numbers, so the 2 services can't drift out of sync. */
    private static String describeStepUpRequirement(WalletServiceClient.StepUpCheckResult check) {
        return ("Giao dịch trên %s/lần hoặc tổng giao dịch chuyển tiền/thanh toán/nạp ví trong ngày "
            + "đạt %s cần xác thực bổ sung theo QĐ 2345/QĐ-NHNN (mô phỏng — lab này không có sinh "
            + "trắc học thật, chỉ yêu cầu 1 bước xác nhận bổ sung)")
            .formatted(formatVnd(check.singleThreshold()), formatVnd(check.dailyThreshold()));
    }

    private static String formatVnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }
}
