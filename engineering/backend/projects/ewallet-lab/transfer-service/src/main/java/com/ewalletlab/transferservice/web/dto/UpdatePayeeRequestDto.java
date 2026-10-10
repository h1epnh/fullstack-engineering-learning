package com.ewalletlab.transferservice.web.dto;

public record UpdatePayeeRequestDto(
    String nickname,
    Boolean isFavorite
) {
}
