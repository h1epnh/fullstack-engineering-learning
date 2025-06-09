package com.example.atg_jwt_generator.infras.utils;

import com.auth0.jwt.algorithms.Algorithm;
//import com.finx.cardservice.core.domain.Token;
//import com.finx.cardservice.core.infra.provider.TokenGenerator;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.interfaces.RSAKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Duration;
import java.time.ZonedDateTime;

import com.example.atg_jwt_generator.domain.object.Token;
import com.example.atg_jwt_generator.domain.repository.TokenGenerator;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AtgTokenGenerator implements TokenGenerator {

    private final String atgIssuer;

    private final Duration duration;

    private final String claim;

    private final Algorithm algorithm;

    public AtgTokenGenerator(
            @Value("${x-pay-integration.atg.issuer}") String atgIssuer,
            @Value("${x-pay-integration.atg.duration}") Duration duration,
            @Value("${x-pay-integration.atg.token-claim}") String claim,
            @Value("${x-pay-integration.atg.private-key}") String privateKey)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        this.atgIssuer = atgIssuer;
        this.duration = duration;
        this.claim = claim;
        this.algorithm = initializeAlgorithm(privateKey);
    }

    private Algorithm initializeAlgorithm(String privateKey)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        byte[] encodedKey = JwtUtils.encodePrivateKey(privateKey);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(encodedKey);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey key = keyFactory.generatePrivate(keySpec);
        return Algorithm.RSA512((RSAKey) key);
    }

    @Override
    public Token generateToken(String cardId, String clientNumber) {
        AtgJwtToken token = new AtgJwtToken(atgIssuer, duration);
        token.setToken(JwtUtils.generateJwtToken(algorithm, token, claim, cardId, clientNumber));
        return token;
    }

    @RequiredArgsConstructor
    private static class AtgJwtToken implements JwtToken {

        private final String issuer;

        private final Duration expiredDuration;

        @Setter private String token;

        @Override
        public String getToken() {
            return token;
        }

        @Override
        public ZonedDateTime getExpiredTime() {
            return ZonedDateTime.now().plus(expiredDuration);
        }

        @Override
        public ZonedDateTime getIssuedTime() {
            return ZonedDateTime.now();
        }

        @Override
        public String issuer() {
            return issuer;
        }
    }
}