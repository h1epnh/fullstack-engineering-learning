package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.TransferResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.server.ResponseStatusException;

/**
 * P2P transfer saga: look up recipient → debit sender → credit recipient, with a compensating
 * credit back to the sender if the credit step fails after the debit already succeeded.
 *
 * <p><strong>Known gap, not hidden:</strong> this is a synchronous, in-memory saga with no
 * persisted state (unlike topup-service's {@code TopupRequest} row, which survives a crash and
 * can be recovered/inspected). If this JVM crashes between the debit and credit calls, the
 * compensation never runs and the sender's money is stuck debited with no recipient credited —
 * a real system would persist saga state (STARTED/DEBITED/CREDITED/COMPENSATED) the same way
 * topup-service does, so a recovery job could finish or roll back an interrupted transfer. Left
 * out here to keep this lab-scale feature from needing its own database.
 */
@Service
public class TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferService.class);

    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final SavedPayeeService savedPayeeService;

    public TransferService(UserServiceClient userServiceClient, WalletServiceClient walletServiceClient,
                           SavedPayeeService savedPayeeService) {
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
        this.savedPayeeService = savedPayeeService;
    }

    public TransferResponseDto transfer(TransferRequestDto request) {
        UserServiceClient.UserResponse recipient = lookupRecipient(request.toPhone());

        if (recipient.id().equals(request.fromUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể chuyển tiền cho chính mình");
        }

        WalletServiceClient.WalletResult senderAfterDebit = debitSender(request, recipient);

        String recipientNote = "Nhận tiền chuyển khoản";
        if (request.greetingCardTheme() != null && !request.greetingCardTheme().isBlank()) {
            String theme = request.greetingCardTheme().trim();
            String msg = request.greetingMessage() != null ? request.greetingMessage().trim() : "";
            recipientNote = msg.isEmpty()
                ? "Nhận tiền kèm thiệp [" + theme + "]"
                : "Nhận tiền kèm thiệp [" + theme + "]: " + msg;
        }

        try {
            walletServiceClient.credit(
                recipient.id(), request.amount(), "TRANSFER_IN", request.fromUserId().toString(),
                recipientNote);
        } catch (Exception creditFailure) {
            log.error("Credit to recipient {} failed after debiting sender {} — compensating",
                recipient.id(), request.fromUserId(), creditFailure);
            walletServiceClient.credit(
                request.fromUserId(), request.amount(), "TRANSFER_IN", recipient.id().toString(),
                "Hoàn tiền do chuyển thất bại");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Chuyển tiền thất bại, số tiền đã được hoàn lại vào ví");
        }

        try {
            savedPayeeService.recordTransfer(request.fromUserId(), request.toPhone());
        } catch (Exception e) {
            log.warn("Failed to record transfer in saved payees for sender {} payee {}: {}",
                request.fromUserId(), request.toPhone(), e.getMessage());
        }

        return new TransferResponseDto(
            request.fromUserId(),
            recipient.id(),
            recipient.name(),
            senderAfterDebit.balance(),
            request.greetingCardTheme(),
            request.greetingMessage()
        );
    }

    private UserServiceClient.UserResponse lookupRecipient(String phone) {
        try {
            return userServiceClient.findByPhone(phone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận với số điện thoại này");
        }
    }

    private WalletServiceClient.WalletResult debitSender(TransferRequestDto request, UserServiceClient.UserResponse recipient) {
        String senderNote = "Chuyển tiền cho " + recipient.name();
        if (request.greetingCardTheme() != null && !request.greetingCardTheme().isBlank()) {
            String theme = request.greetingCardTheme().trim();
            String msg = request.greetingMessage() != null ? request.greetingMessage().trim() : "";
            senderNote = msg.isEmpty()
                ? senderNote + " (Thiệp " + theme + ")"
                : senderNote + " (Thiệp " + theme + ": " + msg + ")";
        }
        try {
            if (request.idempotencyKey() != null && !request.idempotencyKey().isBlank()) {
                return walletServiceClient.debit(
                    request.fromUserId(), request.amount(), recipient.id().toString(),
                    senderNote, request.isStepUpConfirmed(), request.idempotencyKey());
            } else {
                return walletServiceClient.debit(
                    request.fromUserId(), request.amount(), recipient.id().toString(),
                    senderNote, request.isStepUpConfirmed());
            }
        } catch (HttpClientErrorException.Conflict e) {
            String msg = e.getResponseBodyAsString();
            if (msg != null && !msg.isBlank()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, msg);
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để chuyển");
        } catch (HttpClientErrorException e) {
            // Issue #15 — wallet-service surfaces "step-up required" as 428 (see
            // StepUpRequiredException's javadoc), distinct from the 409 above. No named subclass
            // for 428 exists on HttpClientErrorException, so check the status explicitly; forward
            // wallet-service's own message (already the precise, sourced Vietnamese copy) rather
            // than re-wording it here.
            if (e.getStatusCode().value() == 428) {
                throw new ResponseStatusException(HttpStatus.valueOf(428), e.getResponseBodyAsString());
            }
            throw e;
        } catch (HttpServerErrorException.ServiceUnavailable e) {
            // Issue #85: wallet-service 503 = debit rejected BEFORE execution (eKYC unverifiable, ADR-02).
            // The debit is the FIRST saga step, so nothing needs undoing; retryable; no credit/refund call.
            // Other 5xx / I/O errors are ambiguous (debit may have applied) and are intentionally not mapped.
            String body = e.getResponseBodyAsString();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, body != null && !body.isBlank() ? body
                : "Hệ thống chưa thể xác minh định danh hoặc xử lý giao dịch lúc này, vui lòng thử lại sau");
        }
    }
}
