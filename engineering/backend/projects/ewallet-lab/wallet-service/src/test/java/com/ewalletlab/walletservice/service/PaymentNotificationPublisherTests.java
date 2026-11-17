package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PaymentNotificationPublisherTests {

    private static Object snsClientOf(PaymentNotificationPublisher p) throws Exception {
        Field f = PaymentNotificationPublisher.class.getDeclaredField("snsClient");
        f.setAccessible(true);
        return f.get(p);
    }

    private static Transaction tx(UUID id) {
        Transaction t = mock(Transaction.class);
        when(t.getId()).thenReturn(id);
        when(t.getType()).thenReturn(TransactionType.TOPUP);
        when(t.getAmount()).thenReturn(new BigDecimal("1000"));
        when(t.getReference()).thenReturn("ref");
        return t;
    }

    @Test
    void flagOff_noSnsClientEvenWithCredentialsPresent_andPublishIsNoOp() throws Exception {
        PaymentNotificationPublisher p = new PaymentNotificationPublisher(
            false, "AKIAFAKEFAKEFAKE", "fake-secret", "ap-southeast-1", "arn:aws:sns:ap-southeast-1:000000000000:fake");
        assertThat(snsClientOf(p)).isNull();
        p.publishPaymentCompletedAsync(UUID.randomUUID(), tx(UUID.randomUUID())); // must not throw / call AWS
    }

    @Test
    void flagOn_withoutCredentials_stillNoClient() throws Exception {
        PaymentNotificationPublisher p = new PaymentNotificationPublisher(true, "", "", "ap-southeast-1", "");
        assertThat(snsClientOf(p)).isNull();
    }

    @Test
    void eventId_isDeterministicPerTransactionAndDiffersAcrossTransactions() {
        UUID a = UUID.randomUUID();
        UUID b = UUID.randomUUID();
        PaymentNotificationPublisher p = new PaymentNotificationPublisher(false, "", "", "ap-southeast-1", "");
        UUID user = UUID.randomUUID();

        Map<String, Object> first = p.buildPayload(user, tx(a));
        Map<String, Object> second = p.buildPayload(user, tx(a));
        Map<String, Object> other = p.buildPayload(user, tx(b));

        assertThat(first.get("eventId")).isEqualTo(second.get("eventId"));
        assertThat(first.get("eventId")).isNotEqualTo(other.get("eventId"));
        assertThat(first.get("eventId")).isEqualTo(PaymentNotificationPublisher.deterministicEventId(a));
        assertThat(first.get("schemaVersion")).isEqualTo(1);
        assertThat(first.get("transactionId")).isEqualTo(a.toString());
    }
}
