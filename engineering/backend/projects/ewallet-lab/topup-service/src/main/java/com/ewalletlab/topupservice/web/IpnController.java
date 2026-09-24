package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import com.ewalletlab.topupservice.service.TopupConfirmationPublisher;
import com.ewalletlab.topupservice.web.dto.IpnRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Receives the async confirmation from mock-bank-gateway — this is what actually credits the
 * wallet, NOT the synchronous response from TopupService.initiate(). Per MoMo's real IPN contract
 * (see ../README.md "Nguồn spec"): respond within 15s, no body required. This lab returns 204
 * immediately and does the Kafka publish inline since there's nothing slow in the critical path;
 * a heavier real implementation would ack first and process asynchronously.
 */
@RestController
public class IpnController {

    private static final Logger log = LoggerFactory.getLogger(IpnController.class);

    private final TopupRequestRepository topupRequestRepository;
    private final TopupConfirmationPublisher confirmationPublisher;

    public IpnController(TopupRequestRepository topupRequestRepository,
                          TopupConfirmationPublisher confirmationPublisher) {
        this.topupRequestRepository = topupRequestRepository;
        this.confirmationPublisher = confirmationPublisher;
    }

    @PostMapping("/ipn/topup")
    public ResponseEntity<Void> handleIpn(@RequestBody IpnRequest ipn) {
        // NOTE: this lab does not re-verify ipn.signature() against MomoStyleSignature — MoMo's
        // docs describe an IPN signature check but the exact field list/order for the IPN
        // signature specifically (as opposed to the create-request signature) wasn't confirmed
        // from the pages fetched while building this. Documented as a known gap, not silently
        // skipped — see README.md "Giới hạn cụ thể". A real implementation MUST verify this.
        TopupRequest topupRequest = topupRequestRepository.findByOrderId(ipn.orderId()).orElse(null);
        if (topupRequest == null) {
            log.warn("IPN for unknown orderId={}", ipn.orderId());
            return ResponseEntity.noContent().build();
        }
        if (topupRequest.getStatus() != TopupStatus.PENDING) {
            log.info("IPN for orderId={} already processed (status={}), ignoring duplicate", ipn.orderId(), topupRequest.getStatus());
            return ResponseEntity.noContent().build();
        }

        boolean success = ipn.resultCode() == 0;
        topupRequest.markStatus(success ? TopupStatus.CONFIRMED : TopupStatus.FAILED);
        topupRequestRepository.save(topupRequest);

        if (success) {
            confirmationPublisher.publish(topupRequest.getUserId(), topupRequest.getAmount(), String.valueOf(ipn.transId()));
        }

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
