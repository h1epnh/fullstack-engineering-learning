package com.example.DDDSample.application.configuration;

import com.example.DDDSample.application.utils.CryptographyUtils;
import com.example.DDDSample.domain.service.HealthService;
import com.example.DDDSample.infastructure.repository.database.HealthRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.security.KeyPair;
import java.security.KeyStore;
import java.security.cert.X509Certificate;
import java.util.Base64;

@Component
@Slf4j
public class ApplicationStartup implements ApplicationListener<ContextRefreshedEvent> {

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        // TODO Auto-generated method stub
        System.out.println("### Application Startup ###");
        // You can add your JPA check logic here (e.g., ProductService.isJpaWorking())


        log.info(">>>>> Test log message 1 <<<<<");
        log.info(">>>>> Test log message 2 <<<<<");



//        HealthService.isJpaWorking();

        KeyPair keyPair = CryptographyUtils.generateKey();
        System.out.println ("-----BEGIN PRIVATE KEY-----");
        System.out.println (Base64.getMimeEncoder().encodeToString(keyPair.getPrivate().getEncoded()));
        System.out.println ("-----END PRIVATE KEY-----");
        System.out.println ("-----BEGIN PUBLIC KEY-----");
        System.out.println (Base64.getMimeEncoder().encodeToString(keyPair.getPublic().getEncoded()));
        System.out.println ("-----END PUBLIC KEY-----");


    }

}
