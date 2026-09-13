package com.example.atg_jwt_generator.infras.utils;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.AESEncrypter;
import com.nimbusds.jose.crypto.MACSigner;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class ATGDigitalsPushProvisioningSDKUtil {

    private static final String SECRET_KEY_ALG_AES = "AES"; // As per doc
    private static final int JWS_EXP_TIME_SECONDS = 120;    // As per doc sample (page 12)
    // (originally EXP_TIME_SECONDS on page 11 of server doc)

    /**
     * Encrypts the payload into a JWE.
     * @param unencryptedString The raw string payload (e.g., JSON card data).
     * @param encSharedSecret The shared secret for JWE encryption (provided by ATG).
     * @return JWE compact serialization string.
     * @throws JOSEException If encryption fails.
     */
    public static String encryptJwe(String unencryptedString, byte[] encSharedSecret) throws JOSEException {
        JWEHeader jweHeader = new JWEHeader.Builder(
                JWEAlgorithm.A256GCMKW,      // Key wrapping algorithm (Page 9)
                EncryptionMethod.A256GCM    // Content encryption algorithm (Page 9)
        ).type(JOSEObjectType.JOSE).build(); // Type can be JOSE or JWT as needed

        JWEObject jweObject = new JWEObject(jweHeader, new Payload(unencryptedString));

        // Create an AES encrypter with the shared secret
        jweObject.encrypt(new AESEncrypter(new SecretKeySpec(encSharedSecret, SECRET_KEY_ALG_AES)));

        return jweObject.serialize();
    }

    /**
     * Creates a JWS (signs the payload).
     * @param payload The string payload to be signed (this will be the JWE string).
     * @param sigSharedSecret The shared secret for JWS signing (provided by ATG).
     * @return JWS compact serialization string.
     * @throws JOSEException If signing fails.
     */
    public static String createJws(String payload, byte[] sigSharedSecret) throws JOSEException {
        // Prepare JWS header
        Map<String, Object> customHeaderParams = new HashMap<>();
        long iatMillis = System.currentTimeMillis();
        long expMillis = iatMillis + (JWS_EXP_TIME_SECONDS * 1000L);

        customHeaderParams.put("iat", iatMillis / 1000L); // seconds since epoch
        customHeaderParams.put("exp", expMillis / 1000L); // seconds since epoch

        JWSHeader jwsHeader = new JWSHeader.Builder(JWSAlgorithm.HS256) // Signature algorithm (Page 9)
                .customParams(customHeaderParams) // Add iat and exp
                .type(JOSEObjectType.JOSE) // Or JWT if the payload itself is a JWT, here it's a JWE string
                .build();

        JWSObject jwsObject = new JWSObject(jwsHeader, new Payload(payload));

        // Create HMAC signer
        JWSSigner signer = new MACSigner(sigSharedSecret);
        jwsObject.sign(signer);

        return jwsObject.serialize();
    }
}