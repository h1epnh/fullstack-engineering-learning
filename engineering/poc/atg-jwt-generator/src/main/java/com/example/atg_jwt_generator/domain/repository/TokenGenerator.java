package com.example.atg_jwt_generator.domain.repository;

//import com.finx.cardservice.core.domain.Token;

import com.example.atg_jwt_generator.domain.object.Token;

public interface TokenGenerator {
    Token generateToken(String cardId, String clientNumber);
}