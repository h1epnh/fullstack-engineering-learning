package com.example.kafka;

import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Properties;

public class SimpleConsumer {
    private static final Logger logger = LoggerFactory.getLogger(SimpleConsumer.class);
    private static final String TOPIC = "my-first-topic";
    private static final String BOOTSTRAP_SERVERS = "localhost:9094";
    private static final String GROUP_ID = "my-java-group";

    public static void main(String[] args) {
        // Configure consumer
        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, GROUP_ID);
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000");

        // Create consumer
        try (KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props)) {
            // Subscribe to topic
            consumer.subscribe(Collections.singletonList(TOPIC));
            
            logger.info("✅ Consumer connected to Kafka");
            logger.info("📥 Subscribed to topic: {}", TOPIC);
            logger.info("Waiting for messages...\\n");
            logger.info("Press Ctrl+C to stop\\n");

            // Poll for messages
            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));

                for (ConsumerRecord<String, String> record : records) {
                    logger.info("📥 Received message:");
                    logger.info("   Topic: {}", record.topic());
                    logger.info("   Partition: {}", record.partition());
                    logger.info("   Offset: {}", record.offset());
                    logger.info("   Key: {}", record.key());
                    logger.info("   Value: {}", record.value());
                    logger.info("   Timestamp: {}\\n", 
                        Instant.ofEpochMilli(record.timestamp()));
                }
            }

        } catch (Exception e) {
            logger.error("❌ Error in consumer", e);
        }

        logger.info("✅ Consumer closed");
    }
}
