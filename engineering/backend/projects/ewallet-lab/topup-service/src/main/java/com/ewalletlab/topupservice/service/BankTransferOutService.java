package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.BankTransferOutRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Unlike top-up (credit only happens after IPN confirms), the wallet debit here happens
 * synchronously up front — the user is sending money out now, and wallet-service's debit call is
 * the real, immediate proof they had the balance. This means a FAILED IPN must refund
 * (BankTransferOutIpnController), the compensating step; a CONFIRMED IPN needs no further wallet
 * action since the debit already happened.
 */
@Service
public class BankTransferOutService {

    private static final Logger log = LoggerFactory.getLogger(BankTransferOutService.class);

    private final BankTransferOutRequestRepository repository;
    private final BankGatewayClient bankGatewayClient;
    private final WalletServiceClient walletServiceClient;

    public BankTransferOutService(BankTransferOutRequestRepository repository,
                                   BankGatewayClient bankGatewayClient,
                                   WalletServiceClient walletServiceClient) {
        this.repository = repository;
        this.bankGatewayClient = bankGatewayClient;
        this.walletServiceClient = walletServiceClient;
    }

    public BankTransferOutRequest initiate(UUID userId, String bankCode, String accountNumber, BigDecimal amount) {
        // Real, synchronous debit — a 409 here (insufficient balance) propagates to the caller
        // before any gateway call or row is created, same fail-fast behavior as WithdrawalController.
        walletServiceClient.debit(userId, amount, "WITHDRAW",
            "Chuyển khoản ra " + bankCode + " ****" + last4(accountNumber));

        String orderId = "bto-" + UUID.randomUUID();
        BankTransferOutRequest request = repository.save(
            new BankTransferOutRequest(orderId, userId, bankCode, accountNumber, amount));

        CollectionResponse response;
        try {
            response = bankGatewayClient.createOutboundTransfer(orderId, amount);
        } catch (Exception gatewayFailure) {
            log.error("mock-bank-gateway create call failed for orderId={} — refunding immediately",
                orderId, gatewayFailure);
            refund(request, "Hoàn tiền do lỗi gọi cổng ngân hàng");
            throw gatewayFailure;
        }

        if (response.resultCode() != 0) {
            log.warn("mock-bank-gateway rejected orderId={} synchronously (resultCode={}) — refunding",
                orderId, response.resultCode());
            refund(request, "Hoàn tiền do cổng ngân hàng từ chối yêu cầu");
        }
        // resultCode == 0 here just means "request accepted" — status stays PENDING until the IPN
        // callback arrives (see BankTransferOutIpnController), exactly like top-up's own flow.
        return request;
    }

    private void refund(BankTransferOutRequest request, String note) {
        request.markStatus(TopupStatus.FAILED);
        repository.save(request);
        walletServiceClient.credit(request.getUserId(), request.getAmount(), "REFUND", note);
    }

    private static String last4(String accountNumber) {
        return accountNumber.length() <= 4 ? accountNumber : accountNumber.substring(accountNumber.length() - 4);
    }
}
