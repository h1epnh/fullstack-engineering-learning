package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import com.ewalletlab.topupservice.service.IpnSignatureVerifier;
import com.ewalletlab.topupservice.service.TopupService;
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
 * wallet, NOT the synchronous response from TopupService.initiate().
 * Issue #66 (TD-04b): Switches to Transactional Outbox pattern so transition to CONFIRMED and
 * OutboxEvent are written atomically. TopupOutboxRelay handles delivery to Kafka.
 */
@RestController
public class IpnController {

    private static final Logger log = LoggerFactory.getLogger(IpnController.class);

    private final TopupRequestRepository topupRequestRepository;
    private final TopupService topupService;
    private final IpnSignatureVerifier signatureVerifier;

    public IpnController(TopupRequestRepository topupRequestRepository,
                          TopupService topupService,
                          IpnSignatureVerifier signatureVerifier) {
        this.topupRequestRepository = topupRequestRepository;
        this.topupService = topupService;
        this.signatureVerifier = signatureVerifier;
    }

    @PostMapping("/ipn/topup")
    public ResponseEntity<Void> handleIpn(@RequestBody IpnRequest ipn) {
        // Issue #52 (TD-03): signature first, before touching any state. Field list = MoMo's
        // documented IPN signature; secret = internal lab pair — see IpnSignatureVerifier.
        // Never log the signature or secret.
        if (!signatureVerifier.isSignatureValid(ipn)) {
            log.warn("Rejected IPN with invalid signature for orderId={}", ipn.orderId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        if (!signatureVerifier.isWithinReplayWindow(ipn, System.currentTimeMillis())) {
            log.warn("Rejected IPN outside replay window for orderId={} responseTime={}", ipn.orderId(), ipn.responseTime());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        TopupRequest topupRequest = topupRequestRepository.findByOrderId(ipn.orderId()).orElse(null);
        if (topupRequest == null) {
            log.warn("IPN for unknown orderId={}", ipn.orderId());
            return ResponseEntity.noContent().build();
        }
        if (topupRequest.getStatus() != TopupStatus.PENDING) {
            log.info("IPN for orderId={} already processed (status={}), ignoring duplicate", ipn.orderId(), topupRequest.getStatus());
            return ResponseEntity.noContent().build();
        }

        if (topupRequest.getAmount().compareTo(java.math.BigDecimal.valueOf(ipn.amount())) != 0) {
            log.warn("Rejected IPN for orderId={}: amount {} does not match top-up amount {}",
                ipn.orderId(), ipn.amount(), topupRequest.getAmount());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        boolean success = ipn.resultCode() == 0;
        if (success) {
            // Issue #66 (TD-04b): Atomic PENDING -> CONFIRMED transition + Outbox event creation
            // in the exact same local database transaction. No more dual-write money loss!
            boolean confirmed = topupService.confirmTopupWithOutbox(
                ipn.orderId(), topupRequest, String.valueOf(ipn.transId()));
            if (!confirmed) {
                log.info("IPN for orderId={} lost the race / already processed, ignoring", ipn.orderId());
                return ResponseEntity.noContent().build();
            }
        } else {
            int updated = topupRequestRepository.transitionFromPending(ipn.orderId(), TopupStatus.FAILED);
            if (updated == 0) {
                log.info("IPN for orderId={} lost the race / already processed, ignoring", ipn.orderId());
                return ResponseEntity.noContent().build();
            }
        }

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
