package com.example.atg_jwt_generator.service;

import com.example.atg_jwt_generator.domain.repository.TokenGenerator;
import com.example.atg_jwt_generator.infras.utils.AtgTokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final TokenGenerator tokenGenerator;

    @Autowired
    public TokenService(TokenGenerator tokenGenerator) {
        this.tokenGenerator = tokenGenerator;
    }

    public String generateToken(String cardId, String clientNumber) {
        return tokenGenerator.generateToken(cardId, clientNumber).getToken();
    }
}
