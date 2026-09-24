package com.ewalletlab.topupservice.web.dto;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.domain.TopupStatus;

public record TopupResponseDto(String orderId, TopupStatus status) {
    public static TopupResponseDto from(TopupRequest request) {
        return new TopupResponseDto(request.getOrderId(), request.getStatus());
    }
}
