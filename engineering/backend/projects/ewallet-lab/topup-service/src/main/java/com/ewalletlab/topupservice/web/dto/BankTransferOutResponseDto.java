package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.BankTransferOutRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;

public record BankTransferOutResponseDto(String orderId, TopupStatus status) {
    public static BankTransferOutResponseDto from(BankTransferOutRequest request) {
        return new BankTransferOutResponseDto(request.getOrderId(), request.getStatus());
    }
}
