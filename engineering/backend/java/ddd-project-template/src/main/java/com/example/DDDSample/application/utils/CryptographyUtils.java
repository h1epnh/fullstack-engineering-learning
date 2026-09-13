package com.example.DDDSample.application.utils;

import javax.security.auth.x500.X500Principal;
import java.io.ByteArrayInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.*;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.sql.Date;

import static java.security.KeyStore.*;

public class CryptographyUtils {
    private CryptographyUtils() {}

    private static final String CN = "app.domain.com"; // Replace with your domain or identifier
    private static final String KEYSTORE_PATH = "./keystore.jks"; // Replace with your JKS path
    private static final String KEYSTORE_PASSWORD = "password"; // Replace with your password
    private static final String KEY_ALIAS = "publicKey"; // Replace with your key alias

    private PublicKey publicKey;
    private long lastFetched = 0; // Timestamp of last fetch

    // Define cache expiration time (e.g., 5 minutes)
    private final long cacheExpiration = 5 * 60 * 1000; // milliseconds


    public static KeyPair generateKey() {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(2048); // Recommended size is 2048 bits for security
            return keyPairGenerator.generateKeyPair();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public PublicKey getPublicKey() throws Exception {
        if (publicKey == null || (System.currentTimeMillis() - lastFetched) > cacheExpiration) {
            publicKey = fetchPublicKeyFromJks();
            lastFetched = System.currentTimeMillis();
        }
        return publicKey;
    }

    public static X509Certificate createSelfSignedCertificate(KeyPair keyPair) throws NoSuchAlgorithmException, CertificateException {
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        InputStream inputStreamPublicKey = new ByteArrayInputStream(keyPair.getPublic().toString().getBytes());
        // Generate a certificate signing request (CSR)
        return (X509Certificate)cf.generateCertificate(inputStreamPublicKey);
    }
    private PublicKey fetchPublicKeyFromJks() throws KeyStoreException, NoSuchAlgorithmException, CertificateException, IOException {
        KeyStore keyStore = getInstance("JKS");
        keyStore.load(new FileInputStream(KEYSTORE_PATH), KEYSTORE_PASSWORD.toCharArray());
        Certificate certificate = keyStore.getCertificate(KEY_ALIAS);
        if (certificate instanceof X509Certificate) {
            return ((X509Certificate) certificate).getPublicKey();
        } else {
            throw new CertificateException("Invalid certificate type in keystore");
        }
    }

    public static String encrypt(String plainText) {
        return plainText;
    }

    public static String decrypt(String encryptedText) {
        return encryptedText;
    }
}
