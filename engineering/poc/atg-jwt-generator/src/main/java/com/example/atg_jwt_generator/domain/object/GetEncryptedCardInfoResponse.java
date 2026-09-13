package com.example.atg_jwt_generator.domain.object;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetEncryptedCardInfoResponse {
    private String encryptedCardInfo;
    private String error;
    private String message;

    public GetEncryptedCardInfoResponse(String encryptedCardInfo, String error, String message) {
        this.encryptedCardInfo = encryptedCardInfo;
        this.error = error;
        this.message = message;
    }

}
