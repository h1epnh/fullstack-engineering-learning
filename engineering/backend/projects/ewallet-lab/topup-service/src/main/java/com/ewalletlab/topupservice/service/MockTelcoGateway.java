package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.TelcoProvider;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Component
public class MockTelcoGateway {

    private final SecureRandom random = new SecureRandom();

    public record ExecutionResult(boolean success, String transactionRef, String errorMessage) {}

    public record CardPinResult(String pinCode, String serialNumber) {}

    public ExecutionResult executeDirectTopup(TelcoProvider provider, String phoneNumber, BigDecimal denomination) {
        // Deterministic failure simulation for automated test scenarios:
        // Any phone number starting with "0900000000" or ending with "000000" simulates network/provider failure
        if ("0900000000".equals(phoneNumber) || (phoneNumber != null && phoneNumber.endsWith("000000"))) {
            return new ExecutionResult(false, null, "Nhà mạng phản hồi: Thuê bao không tồn tại hoặc đường truyền viễn thông gián đoạn");
        }
        String ref = provider.name() + "-" + System.currentTimeMillis() + "-" + (1000 + random.nextInt(9000));
        return new ExecutionResult(true, ref, null);
    }

    public CardPinResult generateCardPin(TelcoProvider provider, BigDecimal denomination) {
        // 12-digit serial number
        long serialNum = 100_000_000_000L + Math.abs(random.nextLong() % 900_000_000_000L);
        // 14-digit PIN code
        long pinNum = 10_000_000_000_000L + Math.abs(random.nextLong() % 90_000_000_000_000L);
        return new CardPinResult(String.valueOf(pinNum), String.valueOf(serialNum));
    }
}
