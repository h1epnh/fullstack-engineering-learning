package com.example.atg_jwt_generator.domain.object;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetTokenResponse {
    private String atgSdkJwt;
    private String error;
    private String message;

    public GetTokenResponse(String atgSdkJwt, String error, String message) {
        this.atgSdkJwt = atgSdkJwt;
        this.error = error;
        this.message = message;
    }
}
