package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.BankTransferOutRequestRepository;
import com.ewalletlab.topupservice.service.WalletServiceClient;
import com.ewalletlab.topupservice.web.dto.IpnRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Confirms or fails an outbound bank transfer. Unlike {@link IpnController} (top-up: IPN success
 * triggers the ONLY credit), the wallet was already debited synchronously when the transfer was
 * initiated — so here, CONFIRMED needs no wallet action, and FAILED must refund the sender. Same
 * known gap as IpnController: this lab does not re-verify ipn.signature().
 */
@RestController
public class BankTransferOutIpnController {

    private static final Logger log = LoggerFactory.getLogger(BankTransferOutIpnController.class);

    private final BankTransferOutRequestRepository repository;
    private final WalletServiceClient walletServiceClient;

    public BankTransferOutIpnController(BankTransferOutRequestRepository repository,
                                         WalletServiceClient walletServiceClient) {
        this.repository = repository;
        this.walletServiceClient = walletServiceClient;
    }

    @PostMapping("/ipn/bank-transfer-out")
    public ResponseEntity<Void> handleIpn(@RequestBody IpnRequest ipn) {
        BankTransferOutRequest request = repository.findByOrderId(ipn.orderId()).orElse(null);
        if (request == null) {
            log.warn("Bank-transfer-out IPN for unknown orderId={}", ipn.orderId());
            return ResponseEntity.noContent().build();
        }
        if (request.getStatus() != TopupStatus.PENDING) {
            log.info("Bank-transfer-out IPN for orderId={} already processed (status={}), ignoring duplicate",
                ipn.orderId(), request.getStatus());
            return ResponseEntity.noContent().build();
        }

        boolean success = ipn.resultCode() == 0;
        request.markStatus(success ? TopupStatus.CONFIRMED : TopupStatus.FAILED);
        repository.save(request);

        if (!success) {
            log.warn("Bank-transfer-out orderId={} failed at the bank — refunding sender {}",
                ipn.orderId(), request.getUserId());
            walletServiceClient.credit(request.getUserId(), request.getAmount(), "REFUND",
                "Hoàn tiền do chuyển khoản ra ngân hàng thất bại");
        }

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
