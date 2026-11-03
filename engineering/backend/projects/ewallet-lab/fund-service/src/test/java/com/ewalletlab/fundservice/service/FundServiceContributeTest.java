package com.ewalletlab.fundservice.service;

import com.ewalletlab.fundservice.domain.Fund;
import com.ewalletlab.fundservice.domain.FundTransaction;
import com.ewalletlab.fundservice.repository.FundMemberRepository;
import com.ewalletlab.fundservice.repository.FundRepository;
import com.ewalletlab.fundservice.repository.FundTransactionRepository;
import com.ewalletlab.fundservice.repository.OutboxEventRepository;
import com.ewalletlab.fundservice.repository.RefundedContributionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Issue #60 — contribute debits the wallet FIRST (synchronously); fund only changes if debit OK. */
class FundServiceContributeTest {

    private final UUID fundId = UUID.randomUUID();
    private final UUID creator = UUID.randomUUID();
    private final UUID member = UUID.randomUUID();
    private final BigDecimal amount = new BigDecimal("9000000");

    private FundRepository fundRepository;
    private FundMemberRepository memberRepository;
    private FundTransactionRepository txRepository;
    private WalletServiceClient wallet;
    private FundService service;
    private FundMutationExecutor executor;
    private RefundedContributionRepository refunded;
    private final java.util.Set<String> refundedKeys = new java.util.HashSet<>();
    private Fund fund;
    private final Map<String, FundTransaction> txByKey = new HashMap<>();

    @BeforeEach
    void setUp() {
        fundRepository = mock(FundRepository.class);
        memberRepository = mock(FundMemberRepository.class);
        txRepository = mock(FundTransactionRepository.class);
        wallet = mock(WalletServiceClient.class);
        fund = new Fund(creator, "A", "0900000001", "Quỹ", "test");
        when(fundRepository.findById(fundId)).thenReturn(Optional.of(fund));
        when(fundRepository.save(any(Fund.class))).thenAnswer(i -> i.getArgument(0));
        when(memberRepository.existsByFundIdAndMemberUserId(fundId, member)).thenReturn(true);
        when(txRepository.findByIdempotencyKey(anyString()))
            .thenAnswer(i -> Optional.ofNullable(txByKey.get(i.<String>getArgument(0))));
        when(txRepository.save(any(FundTransaction.class))).thenAnswer(i -> {
            FundTransaction t = i.getArgument(0);
            txByKey.put(t.getIdempotencyKey(), t);
            return t;
        });
        when(wallet.stepUpCheck(any(), any()))
            .thenReturn(new WalletServiceClient.StepUpCheckResult(false, BigDecimal.ZERO, BigDecimal.TEN, BigDecimal.TEN));
        refunded = mock(RefundedContributionRepository.class);
        when(refunded.save(any())).thenAnswer(i -> {
            com.ewalletlab.fundservice.domain.RefundedContribution r = i.getArgument(0);
            refundedKeys.add(r.getIdempotencyKey());
            return r;
        });
        when(refunded.existsById(anyString())).thenAnswer(i -> refundedKeys.contains(i.<String>getArgument(0)));
        executor = new FundMutationExecutor(fundRepository, memberRepository, txRepository,
            mock(OutboxEventRepository.class), new ObjectMapper(), refunded);
        service = new FundService(fundRepository, memberRepository, txRepository, mock(UserServiceClient.class),
            wallet, executor, refunded);
    }

    @Test
    void contributeBeyondWalletBalanceReturns409AndFundUnchanged() {
        when(wallet.debit(any(), any(), anyString(), anyString(), anyString(), anyBoolean(), anyString()))
            .thenThrow(HttpClientErrorException.create(HttpStatus.CONFLICT, "Conflict", new HttpHeaders(),
                "Insufficient balance".getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));

        assertThatThrownBy(() -> service.contribute(fundId, member, amount, false, "k1"))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode().value()).isEqualTo(409));

        assertThat(fund.getBalance()).isEqualByComparingTo("0");
        verify(fundRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    @Test
    void successfulContributeDebitsWalletThenCreditsFund() {
        service.contribute(fundId, member, amount, false, "k1");

        assertThat(fund.getBalance()).isEqualByComparingTo("9000000");
        verify(wallet).debit(eq(member), eq(amount), eq("TRANSFER_OUT"), eq(fundId.toString()), anyString(),
            eq(false), eq("fund-contribute:" + fundId + ":" + member + ":k1"));
        assertThat(txByKey).hasSize(1);
    }

    @Test
    void retryWithSameKeyDoesNotDebitOrCreditTwice() {
        service.contribute(fundId, member, amount, false, "k1");
        service.contribute(fundId, member, amount, false, "k1");

        assertThat(fund.getBalance()).isEqualByComparingTo("9000000");
        verify(wallet, times(1)).debit(any(), any(), anyString(), anyString(), anyString(), anyBoolean(), anyString());
        assertThat(txByKey).hasSize(1);
    }

    @Test
    void fundCreditFailureAfterDebitRefundsWalletWithOwnKey() {
        when(fundRepository.save(any(Fund.class))).thenThrow(new ObjectOptimisticLockingFailureException(Fund.class, fundId));

        assertThatThrownBy(() -> service.contribute(fundId, member, amount, false, "k2"))
            .isInstanceOf(ObjectOptimisticLockingFailureException.class);

        verify(wallet).credit(eq(member), eq(amount), eq("TRANSFER_IN"), eq(fundId.toString()), anyString(),
            eq("refund:fund-contribute:" + fundId + ":" + member + ":k2"));
    }

    @Test
    void ambiguousDebitFailureReturns502AndNeverTouchesFundOrRefunds() {
        when(wallet.debit(any(), any(), anyString(), anyString(), anyString(), anyBoolean(), anyString()))
            .thenThrow(new org.springframework.web.client.ResourceAccessException("timeout"));

        assertThatThrownBy(() -> service.contribute(fundId, member, amount, false, "k3"))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode().value()).isEqualTo(502));

        verify(fundRepository, never()).save(any());
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void replayAfterRefundDoesNotCreditFundNorDebitAgain() {
        // first attempt: fund credit keeps failing -> refunded
        when(fundRepository.save(any(Fund.class))).thenThrow(new ObjectOptimisticLockingFailureException(Fund.class, fundId));
        assertThatThrownBy(() -> service.contribute(fundId, member, amount, false, "q3"))
            .isInstanceOf(ObjectOptimisticLockingFailureException.class);
        verify(wallet, times(1)).credit(any(), any(), anyString(), anyString(), anyString(), anyString());

        // (the mocked Fund entity is shared across retries, unlike real per-attempt reloads: snapshot it)
        BigDecimal balanceAfterFirst = fund.getBalance();
        // replay the same key, fund save would now succeed
        when(fundRepository.save(any(Fund.class))).thenAnswer(i -> i.getArgument(0));
        assertThatThrownBy(() -> service.contribute(fundId, member, amount, false, "q3"))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode().value()).isEqualTo(409));

        assertThat(fund.getBalance()).isEqualByComparingTo(balanceAfterFirst);
        verify(wallet, times(1)).debit(any(), any(), anyString(), anyString(), anyString(), anyBoolean(), anyString());
        assertThat(txByKey).isEmpty();
    }

    private String key(String k) {
        return "fund-contribute:" + fundId + ":" + member + ":" + k;
    }

    @Test
    void refundDecisionWhileConcurrentSameKeyCreditCommittedDoesNotRefund() {
        FundMutationExecutor mocked = mock(FundMutationExecutor.class);
        when(mocked.contributeOnce(any(), any(), any(), anyString()))
            .thenThrow(new ObjectOptimisticLockingFailureException(Fund.class, fundId));
        when(mocked.markRefundedUnlessCredited(key("ka"))).thenReturn(false); // credit committed by the other request
        FundService svc = new FundService(fundRepository, memberRepository, txRepository,
            mock(UserServiceClient.class), wallet, mocked, refunded);

        Fund result = svc.contribute(fundId, member, amount, false, "ka");

        assertThat(result).isSameAs(fund);
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString(), anyString());
    }

    @Test
    void contributeOnceRefusesWhenMarkerExistsAndFundUnchanged() {
        refundedKeys.add(key("kb"));

        assertThatThrownBy(() -> executor.contributeOnce(fundId, member, amount, key("kb")))
            .isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode().value()).isEqualTo(409));

        assertThat(fund.getBalance()).isEqualByComparingTo("0");
        verify(fundRepository, never()).save(any());
        verify(txRepository, never()).save(any());
    }

    @Test
    void creditCommittedButAckLostDoesNotRefund() {
        FundMutationExecutor spy = org.mockito.Mockito.spy(executor);
        org.mockito.Mockito.doAnswer(i -> {
            i.callRealMethod();                       // credit + FundTransaction committed
            throw new RuntimeException("ack lost");   // ...but the caller sees an exception
        }).when(spy).contributeOnce(any(), any(), any(), anyString());
        FundService svc = new FundService(fundRepository, memberRepository, txRepository,
            mock(UserServiceClient.class), wallet, spy, refunded);

        svc.contribute(fundId, member, amount, false, "kc");

        assertThat(fund.getBalance()).isEqualByComparingTo("9000000");
        assertThat(txByKey).hasSize(1);
        assertThat(refundedKeys).isEmpty();
        verify(wallet, never()).credit(any(), any(), anyString(), anyString(), anyString(), anyString());
    }
}
