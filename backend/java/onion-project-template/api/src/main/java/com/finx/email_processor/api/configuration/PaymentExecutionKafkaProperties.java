package com.finx.email_processor.api.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@ConfigurationProperties(prefix = "kafka")
@Data
public class PaymentExecutionKafkaProperties {
    private String securityProtocol;
    private String sslProtocol;
    private String sslEndpointIdentificationAlgorithmConfig;
    private String saslUsername;
    private String saslPassword;
    private String saslMechanisms;

    @NestedConfigurationProperty private KafkaProperty thoughtMachine;
    @NestedConfigurationProperty private KafkaProperty settlementService;

    @Data
    static class KafkaProperty {
        private String server;
        private String groupId;
    }
}
