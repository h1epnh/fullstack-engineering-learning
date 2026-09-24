package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.TransferResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
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

    public TransferService(UserServiceClient userServiceClient, WalletServiceClient walletServiceClient) {
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
    }

    public TransferResponseDto transfer(TransferRequestDto request) {
        UserServiceClient.UserResponse recipient = lookupRecipient(request.toPhone());

        if (recipient.id().equals(request.fromUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể chuyển tiền cho chính mình");
        }

        WalletServiceClient.WalletResult senderAfterDebit = debitSender(request, recipient);

        try {
            walletServiceClient.credit(
                recipient.id(), request.amount(), "TRANSFER_IN", request.fromUserId().toString(),
                "Nhận tiền chuyển khoản");
        } catch (Exception creditFailure) {
            log.error("Credit to recipient {} failed after debiting sender {} — compensating",
                recipient.id(), request.fromUserId(), creditFailure);
            walletServiceClient.credit(
                request.fromUserId(), request.amount(), "TRANSFER_IN", recipient.id().toString(),
                "Hoàn tiền do chuyển thất bại");
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Chuyển tiền thất bại, số tiền đã được hoàn lại vào ví");
        }

        return new TransferResponseDto(request.fromUserId(), recipient.id(), recipient.name(), senderAfterDebit.balance());
    }

    private UserServiceClient.UserResponse lookupRecipient(String phone) {
        try {
            return userServiceClient.findByPhone(phone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận với số điện thoại này");
        }
    }

    private WalletServiceClient.WalletResult debitSender(TransferRequestDto request, UserServiceClient.UserResponse recipient) {
        try {
            return walletServiceClient.debit(
                request.fromUserId(), request.amount(), recipient.id().toString(),
                "Chuyển tiền cho " + recipient.name());
        } catch (HttpClientErrorException.Conflict e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư không đủ để chuyển");
        }
    }
}
