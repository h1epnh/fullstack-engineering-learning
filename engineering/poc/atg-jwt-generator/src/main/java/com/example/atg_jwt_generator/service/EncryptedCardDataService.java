package com.example.atg_jwt_generator.service;

import com.example.atg_jwt_generator.infras.utils.ATGDigitalsPushProvisioningSDKUtil;
import com.nimbusds.jose.JOSEException;
import org.apache.commons.codec.DecoderException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.apache.commons.codec.binary.Hex;

import java.nio.charset.StandardCharsets;

@Service
public class EncryptedCardDataService {

    private static final Logger logger = LoggerFactory.getLogger(EncryptedCardDataService.class);

//    @Value("${x-pay-integration.atg.card-data.enc-secret}")
    private String encSecretString;

//    @Value("${x-pay-integration.atg.card-data.sig-secret}")
    private String sigSecretString;

    // In a real app, card details might come from a request DTO or a database
    public String generateEncryptedCardData(String accountNumber, String expiryMonth, String expiryYear) {
        // 1. CREATE PAYLOAD WITH CARD INFO (as per server doc page 13)
        //    IMPORTANT CLARIFICATION: Does ATG expect raw PAN here, or an OPC from MDES/VTS?
        //    For this POC, we assume raw card details as per the simple JSON structure.
        //    Also, a real app should include more details like CVV, name, address if needed
        //    by the scheme or ATG after this JWE.
        String cardPayloadJson = String.format(
                "{ \"accountNumber\":\"%s\", \"expiryMonth\":\"%s\", \"expiryYear\":\"%s\" }",
                accountNumber, expiryMonth, expiryYear
        );
        logger.info("Raw Card Payload for JWE: {}", cardPayloadJson);

        encSecretString = "c432ce02a852bc075b40b8dc180ade38cec62fca7063d9c3e1c6bb17694663fd";
        sigSecretString = "76b0ba1b713ceaaceaf2d8f1105baab977274d770ba2086f77d644ac53d67918";

        try {
            byte[] encSharedSecretBytes = encSecretString.getBytes(StandardCharsets.UTF_8);
            byte[] sigSharedSecretBytes = sigSecretString.getBytes(StandardCharsets.UTF_8);



            // 2. ENCRYPT CARD PAYLOAD (JWE)
            String encryptedPayloadJwe = ATGDigitalsPushProvisioningSDKUtil.encryptJwe(cardPayloadJson, encSharedSecretBytes);
            logger.debug("Encrypted JWE Payload: {}", encryptedPayloadJwe);

            // 3. SIGN THE JWE (OUTER JWS)
            String signedPayloadJws = ATGDigitalsPushProvisioningSDKUtil.createJws(encryptedPayloadJwe, sigSharedSecretBytes);
            logger.info("Final Signed JWS (EncryptedData): {}", signedPayloadJws);

            return signedPayloadJws;

        } catch (JOSEException e) {
            logger.error("Error generating encrypted card data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate encrypted card data", e);
        }
    }
}