package com.example.kafka;

import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.concurrent.ExecutionException;

public class SimpleProducer {
    private static final Logger logger = LoggerFactory.getLogger(SimpleProducer.class);
    private static final String TOPIC = "my-first-topic";
    private static final String BOOTSTRAP_SERVERS = "localhost:9094";

    public static void main(String[] args) {
        // Configure producer
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, BOOTSTRAP_SERVERS);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 1);

        // Create producer
        try (KafkaProducer<String, String> producer = new KafkaProducer<>(props)) {
            logger.info("✅ Producer connected to Kafka");
            logger.info("📤 Sending messages to topic: {}", TOPIC);
            logger.info("Press Ctrl+C to stop\\n");

            int messageCount = 0;

            // Send messages continuously
            while (true) {
                String key = "key-" + messageCount;
                String value = String.format("Hello Kafka! Message #%d at %s", 
                    messageCount, 
                    java.time.Instant.now());

                ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, key, value);

                // Send asynchronously with callback
                producer.send(record, (metadata, exception) -> {
                    if (exception != null) {
                        logger.error("❌ Error sending message", exception);
                    } else {
                        logger.info("📤 Sent message: {}", value);
                        logger.info("   Topic: {}, Partition: {}, Offset: {}\\n", 
                            metadata.topic(), 
                            metadata.partition(), 
                            metadata.offset());
                    }
                });

                messageCount++;
                Thread.sleep(2000); // Send a message every 2 seconds
            }

        } catch (InterruptedException e) {
            logger.info("\\n🛑 Shutting down producer...");
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            logger.error("❌ Error in producer", e);
        }

        logger.info("✅ Producer closed");
    }
}
