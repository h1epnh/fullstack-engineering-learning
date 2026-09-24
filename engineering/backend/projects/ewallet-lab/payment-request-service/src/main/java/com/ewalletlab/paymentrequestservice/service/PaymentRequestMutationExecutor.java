package com.ewalletlab.paymentrequestservice.service;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestStatus;
import com.ewalletlab.paymentrequestservice.repository.PaymentRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Holds the actual, single-attempt, {@code @Transactional} status-transition logic in a bean
 * separate from {@link PaymentRequestService} on purpose — same reason wallet-service's
 * {@code WalletMutationExecutor} is split from {@code WalletService} (issue #5): retrying a lost
 * optimistic-lock race needs each attempt to run in a brand-new transaction that re-reads the row
 * (and its {@code @Version}) from scratch, which only works across a proxy boundary.
 *
 * <p><b>Fix for the critical race bug found by agent-tester on issues #3/#8</b>: the original
 * {@code pay()} read {@code status == PENDING}, called transfer-service's real {@code /transfers}
 * (moving real money), and only THEN wrote {@code PAID} — with no lock between the read and the
 * write, every concurrent caller's read saw {@code PENDING} and every one of them called
 * transfer-service, multiplying real money movement; the {@code @Version} write at the end only
 * decided who got the final row, not who got to move money. {@link #claimPendingOnce} inverts the
 * order: it atomically claims {@code PENDING -> PAID} FIRST, protected by optimistic locking, and
 * only the winner of that claim is allowed to call transfer-service at all (see
 * {@code PaymentRequestService.pay}).
 */
@Component
class PaymentRequestMutationExecutor {

    private final PaymentRequestRepository repository;

    PaymentRequestMutationExecutor(PaymentRequestRepository repository) {
        this.repository = repository;
    }

    @Transactional
    PaymentRequest claimPendingOnce(UUID id, UUID payerUserId) {
        PaymentRequest r = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu thanh toán này"));
        if (r.getStatus() != PaymentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, switch (r.getStatus()) {
                case PAID -> "Yêu cầu này đã được thanh toán rồi";
                case CANCELLED -> "Yêu cầu này đã bị huỷ";
                case EXPIRED -> "Yêu cầu này đã hết hạn";
                case PENDING -> "Không thể thanh toán yêu cầu này";
            });
        }
        r.markPaidPending(payerUserId);
        return repository.save(r);
    }

    @Transactional
    PaymentRequest attachTransferReference(UUID id, String transferReference) {
        PaymentRequest r = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu thanh toán này"));
        r.attachTransferReference(transferReference);
        return repository.save(r);
    }

    /** Compensates a claim whose transfer-service call failed afterwards (insufficient balance,
     * creator not found, network error, ...) — reverts back to PENDING so the request isn't stuck
     * "PAID" with no money having actually moved. Only the claim's winner ever calls this for a
     * given row, so there's no concurrent writer to race against here. */
    @Transactional
    void releaseClaim(UUID id) {
        repository.findById(id).ifPresent(r -> {
            r.revertToPending();
            repository.save(r);
        });
    }
}
