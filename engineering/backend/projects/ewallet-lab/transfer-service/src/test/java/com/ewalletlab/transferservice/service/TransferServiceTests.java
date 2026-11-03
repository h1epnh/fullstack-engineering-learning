package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.TransferResponseDto;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTests {

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private WalletServiceClient walletServiceClient;

    @Mock
    private SavedPayeeService savedPayeeService;

    private TransferService transferService;
    private Validator validator;

    @BeforeEach
    void setUp() {
        transferService = new TransferService(userServiceClient, walletServiceClient, savedPayeeService);
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    @DisplayName("Chuyển tiền thông thường không kèm thiệp thành công")
    void testTransferWithoutCard() {
        UUID fromUserId = UUID.randomUUID();
        UUID toUserId = UUID.randomUUID();
        String toPhone = "0987654321";
        BigDecimal amount = new BigDecimal("50000");

        TransferRequestDto req = new TransferRequestDto(fromUserId, toPhone, amount, false);

        when(userServiceClient.findByPhone(toPhone)).thenReturn(
            new UserServiceClient.UserResponse(toUserId, toPhone, "Trần Thị B")
        );
        when(walletServiceClient.debit(eq(fromUserId), eq(amount), eq(toUserId.toString()), eq("Chuyển tiền cho Trần Thị B"), eq(false)))
            .thenReturn(new WalletServiceClient.WalletResult(fromUserId, new BigDecimal("150000")));

        TransferResponseDto res = transferService.transfer(req);

        assertNotNull(res);
        assertEquals(fromUserId, res.fromUserId());
        assertEquals(toUserId, res.toUserId());
        assertEquals("Trần Thị B", res.toName());
        assertEquals(new BigDecimal("150000"), res.newBalance());
        assertNull(res.greetingCardTheme());
        assertNull(res.greetingMessage());

        verify(walletServiceClient).credit(eq(toUserId), eq(amount), eq("TRANSFER_IN"), eq(fromUserId.toString()), eq("Nhận tiền chuyển khoản"));
    }

    @Test
    @DisplayName("Chuyển tiền kèm thiệp BIRTHDAY và lời chúc may mắn")
    void testTransferWithGreetingCardAndMessage() {
        UUID fromUserId = UUID.randomUUID();
        UUID toUserId = UUID.randomUUID();
        String toPhone = "0987654321";
        BigDecimal amount = new BigDecimal("68686");
        String theme = "BIRTHDAY";
        String message = "Chúc mừng sinh nhật tuổi mới rực rỡ nhé!";

        TransferRequestDto req = new TransferRequestDto(fromUserId, toPhone, amount, false, theme, message);

        when(userServiceClient.findByPhone(toPhone)).thenReturn(
            new UserServiceClient.UserResponse(toUserId, toPhone, "Lê Văn C")
        );
        when(walletServiceClient.debit(eq(fromUserId), eq(amount), eq(toUserId.toString()), contains("Thiệp BIRTHDAY: Chúc mừng sinh nhật"), eq(false)))
            .thenReturn(new WalletServiceClient.WalletResult(fromUserId, new BigDecimal("200000")));

        TransferResponseDto res = transferService.transfer(req);

        assertNotNull(res);
        assertEquals(theme, res.greetingCardTheme());
        assertEquals(message, res.greetingMessage());

        verify(walletServiceClient).credit(
            eq(toUserId),
            eq(amount),
            eq("TRANSFER_IN"),
            eq(fromUserId.toString()),
            eq("Nhận tiền kèm thiệp [BIRTHDAY]: Chúc mừng sinh nhật tuổi mới rực rỡ nhé!")
        );
    }

    @Test
    @DisplayName("Lời chúc vượt quá 150 ký tự vi phạm Bean Validation @Size(max=150)")
    void testGreetingMessageExceeds150Chars() {
        UUID fromUserId = UUID.randomUUID();
        String longMessage = "Chúc ".repeat(40); // > 150 ký tự
        TransferRequestDto req = new TransferRequestDto(
            fromUserId, "0987654321", new BigDecimal("88888"), false, "CELEBRATION", longMessage
        );

        Set<ConstraintViolation<TransferRequestDto>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("greetingMessage")));
    }

    @Test
    @DisplayName("Không cho phép chuyển tiền cho chính mình")
    void testTransferToSelfThrowsBadRequest() {
        UUID selfId = UUID.randomUUID();
        String phone = "0911223344";

        TransferRequestDto req = new TransferRequestDto(selfId, phone, new BigDecimal("10000"), false);
        when(userServiceClient.findByPhone(phone)).thenReturn(
            new UserServiceClient.UserResponse(selfId, phone, "Chính Tôi")
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> transferService.transfer(req));
        assertTrue(ex.getMessage().contains("Không thể chuyển tiền cho chính mình"));
    }

    @Test
    @DisplayName("Chuyển tiền truyền idempotencyKey xuyên suốt xuống wallet-service debit")
    void testTransferWithIdempotencyKey() {
        UUID fromUserId = UUID.randomUUID();
        UUID toUserId = UUID.randomUUID();
        String toPhone = "0988776655";
        BigDecimal amount = new BigDecimal("50000");
        String idempotencyKey = "pay-req:" + UUID.randomUUID();

        TransferRequestDto req = new TransferRequestDto(fromUserId, toPhone, amount, false, null, null, idempotencyKey);

        when(userServiceClient.findByPhone(toPhone)).thenReturn(
            new UserServiceClient.UserResponse(toUserId, toPhone, "Nguyễn Văn D")
        );
        when(walletServiceClient.debit(eq(fromUserId), eq(amount), eq(toUserId.toString()), contains("Chuyển tiền cho"), eq(false), eq(idempotencyKey)))
            .thenReturn(new WalletServiceClient.WalletResult(fromUserId, new BigDecimal("450000")));

        TransferResponseDto res = transferService.transfer(req);
        assertNotNull(res);

        verify(walletServiceClient).debit(eq(fromUserId), eq(amount), eq(toUserId.toString()), contains("Chuyển tiền cho"), eq(false), eq(idempotencyKey));
        verify(walletServiceClient).credit(eq(toUserId), eq(amount), eq("TRANSFER_IN"), eq(fromUserId.toString()), anyString());
    }
}
