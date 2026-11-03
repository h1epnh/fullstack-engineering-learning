package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * ADR-06 (DESIGN.md) — publishes a {@code payment.completed} event to the SNS topic
 * {@code ewallet-lab-payment-completed} AFTER a debit/credit's own {@code @Transactional} method
 * has already committed (see {@link WalletService#credit}/{@link WalletService#debit}, which call
 * this ONLY once {@link WalletMutationExecutor#creditOnce}/{@code debitOnce} have already
 * returned). This is a second, isolated async layer: it does NOT replace, touch, or route any of
 * the existing Kafka/Outbox flows in fund-service/lucky-money-service/topup-service/
 * payment-request-service/bill-payment-service.
 *
 * <p><b>Best-effort, by design (Nguyên lý 7 in CLAUDE.md):</b> every call here runs on a
 * dedicated executor, fire-and-forget — {@link #publishPaymentCompletedAsync} returns
 * immediately, so a slow or unreachable AWS endpoint can never add latency to (or fail) the
 * HTTP response the caller already has in hand. Any publish failure/timeout is caught and logged
 * at WARN only: losing 1 notification is acceptable, re-throwing here would have zero caller left
 * to roll back anyway (the ledger write already committed) and would just be a pointless crash.
 *
 * <p><b>Fails closed on configuration, not on network:</b> if {@code AWS_ACCESS_KEY_ID} /
 * {@code AWS_SECRET_ACCESS_KEY} / {@code SNS_TOPIC_ARN} are not all set (e.g. local
 * docker-compose, or before the operator has run {@code scripts/init-aws-infra.sh} and created
 * the {@code ewallet-lab-aws-notify} k8s Secret), this publisher logs ONE warning at startup and
 * silently no-ops on every call afterwards — it never throws for a missing credential, since this
 * capability must never be able to block a debit/credit.
 */
@Component
class PaymentNotificationPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentNotificationPublisher.class);
    private static final int SCHEMA_VERSION = 1;

    private final SnsClient snsClient; // null when SNS publishing is disabled (see javadoc above)
    private final String topicArn;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    PaymentNotificationPublisher(@Value("${ewallet-lab.aws.access-key-id:}") String accessKeyId,
                                  @Value("${ewallet-lab.aws.secret-access-key:}") String secretAccessKey,
                                  @Value("${ewallet-lab.aws.region:ap-southeast-1}") String region,
                                  @Value("${ewallet-lab.sns.topic-arn:}") String topicArn) {
        this.topicArn = topicArn;
        if (accessKeyId.isBlank() || secretAccessKey.isBlank() || topicArn.isBlank()) {
            log.warn("ADR-06 SNS publish DISABLED: AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/SNS_TOPIC_ARN not " +
                "fully configured (expected via k8s Secret ewallet-lab-aws-notify + Helm value aws.snsTopicArn, " +
                "see scripts/init-aws-infra.sh). Every credit/debit will skip the payment.completed publish — " +
                "this never blocks or fails a credit/debit, it only means no notification fan-out happens.");
            this.snsClient = null;
        } else {
            this.snsClient = SnsClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                // Bounded so a hung network call can't accumulate indefinitely on the background
                // executor — still never touches the caller's own request thread either way.
                .overrideConfiguration(ClientOverrideConfiguration.builder().apiCallTimeout(Duration.ofSeconds(5)).build())
                .build();
        }
    }

    /**
     * Fire-and-forget. Safe to call for every successful credit/debit — no-ops instantly if SNS
     * publishing is disabled (see constructor javadoc), otherwise submits the actual publish to a
     * background virtual thread and returns immediately.
     */
    void publishPaymentCompletedAsync(UUID userId, Transaction transaction) {
        if (snsClient == null) {
            return;
        }
        executor.submit(() -> doPublish(userId, transaction));
    }

    private void doPublish(UUID userId, Transaction transaction) {
        try {
            String json = objectMapper.writeValueAsString(buildPayload(userId, transaction));
            snsClient.publish(PublishRequest.builder().topicArn(topicArn).message(json).build());
        } catch (Exception e) {
            // Never rethrown: this runs on a background executor nobody is waiting on, and the
            // ledger write this notification describes already committed successfully — there is
            // nothing left to roll back, and nothing to surface to a caller that returned already.
            log.warn("ADR-06 SNS publish FAILED for transactionId={} userId={} (best-effort, ledger already " +
                "committed, response already sent — not retried here, SQS-side DLQ/redrive does not apply " +
                "since the message never left wallet-service): {}", transaction.getId(), userId, e.toString());
        }
    }

    /**
     * Builds exactly ADR-06's documented schema (DESIGN.md) — every field is either a literal
     * constant from that schema or a REAL wallet-service value ({@link Transaction}'s own
     * id/type/amount/reference, {@link com.ewalletlab.walletservice.domain.TransactionType}'s own
     * {@code direction()}). No field or enum value is invented here (CLAUDE.md's explicit warning
     * about services inventing fields/values for data another service/consumer will read).
     */
    private Map<String, Object> buildPayload(UUID userId, Transaction transaction) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("schemaVersion", SCHEMA_VERSION);
        payload.put("eventId", UUID.randomUUID().toString());
        payload.put("eventType", "payment.completed");
        payload.put("occurredAt", Instant.now().toString());
        payload.put("transactionId", transaction.getId().toString());
        payload.put("userId", userId.toString());
        payload.put("transactionType", transaction.getType().name());
        payload.put("direction", transaction.getType().direction().name());
        payload.put("amount", transaction.getAmount().toPlainString());
        payload.put("reference", transaction.getReference());
        return payload;
    }
}
