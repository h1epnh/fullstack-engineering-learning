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
 * <p><b>Issue #67 (TD-04c) Honest State Machine</b>: The status transition PENDING -> PAYING is
 * claimed atomically FIRST, protected by optimistic locking. Only the winner of that claim is
 * allowed to call transfer-service. When transfer-service succeeds, {@link #markPaid} moves the row
 * to {@code PAID}. If transfer-service fails with a deterministic client error (4xx: insufficient
 * balance, step-up needed, not found), {@link #releaseClaim} rolls it back to {@code PENDING}.
 * If the process is killed mid-flight, the record stays {@code PAYING} (an honest representation of
 * in-flight work) and never gets stuck "PAID" before money moved.
 */
@Component
class PaymentRequestMutationExecutor {

    private final PaymentRequestRepository repository;

    PaymentRequestMutationExecutor(PaymentRequestRepository repository) {
        this.repository = repository;
    }

    @Transactional
    PaymentRequest claimPayingOnce(UUID id, UUID payerUserId) {
        PaymentRequest r = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu thanh toán này"));
        if (r.getStatus() != PaymentRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, switch (r.getStatus()) {
                case PAID -> "Yêu cầu này đã được thanh toán rồi";
                case PAYING -> "Yêu cầu này đang được xử lý thanh toán";
                case CANCELLED -> "Yêu cầu này đã bị huỷ";
                case EXPIRED -> "Yêu cầu này đã hết hạn";
                case PENDING -> "Không thể thanh toán yêu cầu này";
            });
        }
        r.markPaying(payerUserId);
        return repository.save(r);
    }

    @Transactional
    PaymentRequest markPaid(UUID id, String transferReference) {
        PaymentRequest r = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu thanh toán này"));
        r.markPaid(transferReference);
        return repository.save(r);
    }

    /**
     * Compensates a claim whose transfer-service call failed with a deterministic client error
     * (insufficient balance, step-up needed, recipient not found). Reverts PAYING -> PENDING so it can be retried.
     */
    @Transactional
    void releaseClaim(UUID id) {
        repository.findById(id).ifPresent(r -> {
            if (r.getStatus() == PaymentRequestStatus.PAYING) {
                r.revertToPending();
                repository.save(r);
            }
        });
    }
}
