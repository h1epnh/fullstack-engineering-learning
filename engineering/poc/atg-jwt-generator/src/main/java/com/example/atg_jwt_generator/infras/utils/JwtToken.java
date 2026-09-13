package com.example.atg_jwt_generator.infras.utils;

//import com.finx.cardservice.core.domain.Token;
import com.example.atg_jwt_generator.domain.object.Token;

import java.time.ZonedDateTime;

public interface JwtToken extends Token {
    ZonedDateTime getExpiredTime();

    ZonedDateTime getIssuedTime();

    String issuer();
}
