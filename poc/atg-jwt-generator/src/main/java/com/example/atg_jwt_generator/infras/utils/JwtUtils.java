package com.example.atg_jwt_generator.infras.utils;

import static com.auth0.jwt.JWT.create;

import com.auth0.jwt.algorithms.Algorithm;
import java.util.Base64;

public class JwtUtils {
    public static byte[] encodePrivateKey(String privateKey) {
        return Base64.getDecoder()
                .decode(
                        privateKey
                                .replace("-----BEGIN PRIVATE KEY-----", "")
                                .replace("-----END PRIVATE KEY-----", "")
                                .replaceAll("\\s+", ""));
    }

    public static String generateJwtToken(Algorithm algorithm, JwtToken token, String claim, String cardId, String clientNumber) {
        return create()
                .withIssuer(token.issuer())
                .withIssuedAt(token.getIssuedTime().toInstant())
                .withNotBefore(token.getIssuedTime().toInstant())
                .withExpiresAt(token.getExpiredTime().toInstant())
//                .withClaim(claim, token.issuer())

                .withClaim("cardId", cardId)
                .withClaim("clientNumber", clientNumber)

                .sign(algorithm);
    }
}