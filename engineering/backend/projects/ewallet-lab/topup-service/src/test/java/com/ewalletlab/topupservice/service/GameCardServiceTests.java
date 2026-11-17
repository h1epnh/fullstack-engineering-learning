package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.GameCardOrder;
import com.ewalletlab.topupservice.domain.GamePublisher;
import com.ewalletlab.topupservice.repository.GameCardOrderRepository;
import com.ewalletlab.topupservice.web.dto.CreateGameCardOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.GameCardOrderDto;
import com.ewalletlab.topupservice.web.dto.GameCardPackageDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;
import com.ewalletlab.topupservice.domain.GameCardOrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameCardServiceTests {

    @Mock
    private GameCardOrderRepository gameCardOrderRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    private GameCardService gameCardService;

    @BeforeEach
    void setUp() {
        gameCardService = new GameCardService(gameCardOrderRepository, walletServiceClient);
    }

    @Test
    void getAvailablePackages_returnsPackagesForAllPublishersWith3PercentDiscount() {
        List<GameCardPackageDto> packages = gameCardService.getAvailablePackages();
        // 7 publishers * 5 denominations = 35 packages
        assertThat(packages).hasSize(35);

        // Check Garena 100k -> 3% discount -> 97,000đ
        GameCardPackageDto garena100k = packages.stream()
            .filter(p -> p.publisher() == GamePublisher.GARENA && p.denomination().compareTo(new BigDecimal("100000")) == 0)
            .findFirst().orElseThrow();

        assertThat(garena100k.discountRate()).isEqualByComparingTo("0.0300");
        assertThat(garena100k.finalPrice()).isEqualByComparingTo("97000");
    }

    @Test
    void purchaseGameCard_success_debitsWalletAndReturnsPinAndSerial() {
        UUID userId = UUID.randomUUID();
        CreateGameCardOrderRequestDto req = new CreateGameCardOrderRequestDto(
            userId,
            GamePublisher.GARENA,
            new BigDecimal("100000"),
            false,
            "k-1"
        );

        stubInMemoryRepo();

        GameCardOrderDto order = gameCardService.purchaseGameCard(req);

        // Verify debit call with finalPrice 97,000 (3% discount)
        verify(walletServiceClient).debit(
            eq(userId),
            eq(new BigDecimal("97000")),
            eq("BILL_PAYMENT"),
            anyString(),
            contains("Garena"),
            eq(false),
            eq("gamecard:" + userId + ":k-1")
        );

        assertThat(order.denomination()).isEqualByComparingTo("100000");
        assertThat(order.finalPrice()).isEqualByComparingTo("97000");
        assertThat(order.discountRate()).isEqualByComparingTo("0.0300");
        assertThat(order.pinCode()).isNotBlank();
        assertThat(order.serialNumber()).isNotBlank();
        assertThat(order.expiryDate()).isEqualTo("31/12/2027");

        GameCardOrder persisted = store.values().iterator().next();
        assertThat(persisted.getPublisher()).isEqualTo(GamePublisher.GARENA);
        assertThat(persisted.getStatus()).isEqualTo(GameCardOrderStatus.COMPLETED);
    }

    private final Map<String, GameCardOrder> store = new ConcurrentHashMap<>();
    private final Map<UUID, GameCardOrder> byId = new ConcurrentHashMap<>();

    /** Row snapshot, like a DB read: atomic w.r.t. the conditional UPDATEs (taken under the row monitor). */
    private GameCardOrder seen(GameCardOrder o) {
        if (o == null) return null;
        synchronized (o) {
            try {
                GameCardOrder copy = new GameCardOrder();
                for (var f : GameCardOrder.class.getDeclaredFields()) {
                    f.setAccessible(true);
                    f.set(copy, f.get(o));
                }
                return copy;
            } catch (ReflectiveOperationException e) {
                throw new IllegalStateException(e);
            }
        }
    }

    /** In-memory repo emulating UNIQUE(idempotencyKey) and the atomic conditional UPDATEs
     * (each guarded by the row monitor, like a DB row lock). */
    private void stubInMemoryRepo() {
        lenient().when(gameCardOrderRepository.findByIdempotencyKey(anyString()))
            .thenAnswer(inv -> Optional.ofNullable(seen(store.get(inv.<String>getArgument(0)))));
        lenient().when(gameCardOrderRepository.findById(any(UUID.class)))
            .thenAnswer(inv -> Optional.ofNullable(seen(byId.get(inv.<UUID>getArgument(0)))));
        lenient().when(gameCardOrderRepository.saveAndFlush(any(GameCardOrder.class))).thenAnswer(inv -> {
            GameCardOrder o = inv.getArgument(0);
            if (store.putIfAbsent(o.getIdempotencyKey(), o) != null) {
                throw new DataIntegrityViolationException("uk_game_card_orders_idem");
            }
            setId(o);
            byId.put(o.getId(), o);
            return o;
        });
        lenient().when(gameCardOrderRepository.takeOverIf(any(), any(), any(), any())).thenAnswer(inv -> {
            GameCardOrder o = byId.get(inv.<UUID>getArgument(0));
            synchronized (o) {
                if (o.getStatus() == GameCardOrderStatus.PENDING
                    && o.getFulfillToken().equals(inv.getArgument(1))) {
                    o.applyTakeOver(inv.getArgument(2), inv.getArgument(3));
                    return 1;
                }
                return 0;
            }
        });
        lenient().when(gameCardOrderRepository.completeIf(any(), any(), any(), any(), any())).thenAnswer(inv -> {
            GameCardOrder o = byId.get(inv.<UUID>getArgument(0));
            synchronized (o) {
                if (o.getStatus() == GameCardOrderStatus.PENDING
                    && o.getFulfillToken().equals(inv.getArgument(1))) {
                    o.applyComplete(inv.getArgument(2), inv.getArgument(3), inv.getArgument(4));
                    return 1;
                }
                return 0;
            }
        });
        lenient().when(gameCardOrderRepository.failForRefundIf(any(), any(), any())).thenAnswer(inv -> {
            GameCardOrder o = byId.get(inv.<UUID>getArgument(0));
            synchronized (o) {
                if (o.getStatus() == GameCardOrderStatus.PENDING
                    && o.getFulfillToken().equals(inv.getArgument(1))) {
                    o.applyFailedRefunded(inv.getArgument(2));
                    return 1;
                }
                return 0;
            }
        });
        lenient().when(gameCardOrderRepository.setFailureReason(any(), any())).thenReturn(1);
        lenient().when(gameCardOrderRepository.deleteClaimIf(any(), any())).thenAnswer(inv -> {
            GameCardOrder o = byId.get(inv.<UUID>getArgument(0));
            synchronized (o) {
                if (o.getStatus() == GameCardOrderStatus.PENDING
                    && o.getFulfillToken().equals(inv.getArgument(1))) {
                    store.remove(o.getIdempotencyKey());
                    byId.remove(o.getId());
                    return 1;
                }
                return 0;
            }
        });
    }

    private void ageClaim(GameCardOrder o) {
        synchronized (o) {
            o.applyTakeOver(o.getFulfillToken(), Instant.now().minusSeconds(120));
        }
    }

    private static void setId(GameCardOrder o) {
        try {
            var f = GameCardOrder.class.getDeclaredField("id");
            f.setAccessible(true);
            f.set(o, UUID.randomUUID());
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }

    private CreateGameCardOrderRequestDto req(UUID userId, String key) {
        return new CreateGameCardOrderRequestDto(userId, GamePublisher.GARENA, new BigDecimal("100000"), false, key);
    }

    @Test
    void purchaseGameCard_duplicateKey_returnsExistingOrder_noSecondDebit() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();

        GameCardOrderDto first = gameCardService.purchaseGameCard(req(userId, "dup"));
        GameCardOrderDto second = gameCardService.purchaseGameCard(req(userId, "dup"));

        assertThat(second.id()).isEqualTo(first.id());
        assertThat(second.pinCode()).isEqualTo(first.pinCode());
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), any(), anyBoolean(), any());
        verify(gameCardOrderRepository, times(1)).completeIf(any(), any(), any(), any(), any());
    }

    @Test
    void purchaseGameCard_sameKeyDifferentPurchase_conflict() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        gameCardService.purchaseGameCard(req(userId, "x"));

        CreateGameCardOrderRequestDto other = new CreateGameCardOrderRequestDto(
            userId, GamePublisher.ZING, new BigDecimal("100000"), false, "x");
        assertThatThrownBy(() -> gameCardService.purchaseGameCard(other))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("idempotencyKey");
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), any(), anyBoolean(), any());
    }

    @Test
    void purchaseGameCard_concurrentSameKey_exactlyOneDebitAndOneCard() throws Exception {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        // slow debit so the other threads hit the claim while the first is in flight
        when(walletServiceClient.debit(any(), any(), any(), any(), any(), anyBoolean(), any())).thenAnswer(inv -> {
            Thread.sleep(150);
            return null;
        });

        int n = 8;
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CountDownLatch go = new CountDownLatch(1);
        List<Future<Object>> results = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            results.add(pool.submit(() -> {
                go.await();
                try {
                    return gameCardService.purchaseGameCard(req(userId, "race"));
                } catch (ResponseStatusException e) {
                    return e; // in-flight loser gets 409 "đang xử lý"
                }
            }));
        }
        go.countDown();
        int cards = 0;
        for (Future<Object> f : results) {
            Object r = f.get(10, TimeUnit.SECONDS);
            if (r instanceof GameCardOrderDto) cards++;
            else assertThat(((ResponseStatusException) r).getStatusCode().value()).isEqualTo(409);
        }
        pool.shutdown();

        assertThat(cards).isEqualTo(1);
        assertThat(store).hasSize(1);
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), any(), anyBoolean(), any());
        verify(gameCardOrderRepository, times(1)).completeIf(any(), any(), any(), any(), any());
    }

    @Test
    void purchaseGameCard_saveFailsAfterDebit_refundsWithOwnKey() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        doThrow(new RuntimeException("constraint violation"))
            .when(gameCardOrderRepository).completeIf(any(), any(), any(), any(), any());

        assertThatThrownBy(() -> gameCardService.purchaseGameCard(req(userId, "boom")))
            .isInstanceOf(ResponseStatusException.class).hasMessageContaining("hoàn lại");

        String debitKey = "gamecard:" + userId + ":boom";
        verify(walletServiceClient).debit(eq(userId), eq(new BigDecimal("97000")), eq("BILL_PAYMENT"),
            anyString(), anyString(), eq(false), eq(debitKey));
        verify(walletServiceClient, times(1)).credit(eq(userId), eq(new BigDecimal("97000")), eq("REFUND"),
            anyString(), anyString(), eq("refund:" + debitKey));
        assertThat(store.get(debitKey).getStatus()).isEqualTo(GameCardOrderStatus.FAILED_REFUNDED);
    }

    @Test
    void purchaseGameCard_cannotProveUnissued_neverRefunds() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        doThrow(new RuntimeException("db down"))
            .when(gameCardOrderRepository).completeIf(any(), any(), any(), any(), any());
        doThrow(new RuntimeException("db down"))
            .when(gameCardOrderRepository).failForRefundIf(any(), any(), any());

        assertThatThrownBy(() -> gameCardService.purchaseGameCard(req(userId, "dbdown")))
            .hasMessageContaining("db down");
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any(), any());
    }

    @Test
    void purchaseGameCard_lostClaimAtCompletion_returnsWinnerAndNeverRefunds() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        // While I am inside the wallet debit, another fulfiller takes over AND completes the order.
        when(walletServiceClient.debit(any(), any(), any(), any(), any(), anyBoolean(), any())).thenAnswer(inv -> {
            GameCardOrder o = store.get("gamecard:" + userId + ":fenced");
            synchronized (o) {
                o.applyTakeOver("other-token", Instant.now());
                o.applyComplete("1111 2222 3333 4444", "5555 6666 7777", "31/12/2027");
            }
            return null;
        });

        GameCardOrderDto dto = gameCardService.purchaseGameCard(req(userId, "fenced"));

        assertThat(dto.pinCode()).isEqualTo("1111 2222 3333 4444");
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any(), any());
    }

    @Test
    void purchaseGameCard_concurrentResumersOfStalePending_oneCardOneDebitNoRefund() throws Exception {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        seedStalePending(userId, "resume");
        when(walletServiceClient.debit(any(), any(), any(), any(), any(), anyBoolean(), any())).thenAnswer(inv -> {
            Thread.sleep(150);
            return null;
        });

        List<Object> results = runParallel(6, () -> gameCardService.purchaseGameCard(req(userId, "resume")));

        Set<String> pins = new HashSet<>();
        int cards = 0;
        for (Object r : results) {
            if (r instanceof GameCardOrderDto d) { cards++; pins.add(d.pinCode()); }
            else assertThat(((ResponseStatusException) r).getStatusCode().value()).isEqualTo(409);
        }
        assertThat(cards).isGreaterThanOrEqualTo(1);
        assertThat(pins).hasSize(1);
        verify(walletServiceClient, times(1)).debit(any(), any(), any(), any(), any(), anyBoolean(), any());
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any(), any());
        assertThat(store.get("gamecard:" + userId + ":resume").getStatus()).isEqualTo(GameCardOrderStatus.COMPLETED);
    }

    @Test
    void purchaseGameCard_slowOriginalRacesResumer_exactlyOnePin() throws Exception {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        when(walletServiceClient.debit(any(), any(), any(), any(), any(), anyBoolean(), any())).thenAnswer(inv -> {
            Thread.sleep(400);
            return null;
        });
        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<Object> original = pool.submit(() -> attempt(() -> gameCardService.purchaseGameCard(req(userId, "slow"))));
        Thread.sleep(100);
        ageClaim(store.get("gamecard:" + userId + ":slow")); // original now looks stale
        Future<Object> resumer = pool.submit(() -> attempt(() -> gameCardService.purchaseGameCard(req(userId, "slow"))));

        Set<String> pins = new HashSet<>();
        for (Future<Object> f : List.of(original, resumer)) {
            Object r = f.get(10, TimeUnit.SECONDS);
            if (r instanceof GameCardOrderDto d) pins.add(d.pinCode());
            else assertThat(((ResponseStatusException) r).getStatusCode().value()).isEqualTo(409);
        }
        pool.shutdown();

        assertThat(pins).hasSize(1);
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any(), any());
        assertThat(store.get("gamecard:" + userId + ":slow").getPinCode()).isEqualTo(pins.iterator().next());
    }

    private void seedStalePending(UUID userId, String key) {
        String debitKey = "gamecard:" + userId + ":" + key;
        GameCardOrder o = new GameCardOrder(userId, GamePublisher.GARENA, new BigDecimal("100000"),
            new BigDecimal("0.0300"), new BigDecimal("97000"), debitKey);
        setId(o);
        store.put(debitKey, o);
        byId.put(o.getId(), o);
        ageClaim(o);
    }

    private static Object attempt(Callable<Object> c) {
        try {
            return c.call();
        } catch (ResponseStatusException e) {
            return e;
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private List<Object> runParallel(int n, Callable<Object> task) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(n);
        CountDownLatch go = new CountDownLatch(1);
        List<Future<Object>> fs = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            fs.add(pool.submit(() -> { go.await(); return attempt(task); }));
        }
        go.countDown();
        List<Object> out = new ArrayList<>();
        for (Future<Object> f : fs) out.add(f.get(10, TimeUnit.SECONDS));
        pool.shutdown();
        return out;
    }

    @Test
    void purchaseGameCard_insufficientBalance_releasesClaimAndPropagates() {
        UUID userId = UUID.randomUUID();
        stubInMemoryRepo();
        when(walletServiceClient.debit(any(), any(), any(), any(), any(), anyBoolean(), any()))
            .thenThrow(HttpClientErrorException.create(HttpStatus.CONFLICT, "Insufficient", null, null, null));

        assertThatThrownBy(() -> gameCardService.purchaseGameCard(req(userId, "poor")))
            .isInstanceOf(HttpClientErrorException.Conflict.class);

        verify(gameCardOrderRepository).deleteClaimIf(any(), any());
        verify(walletServiceClient, never()).credit(any(), any(), any(), any(), any(), any());
    }

    @Test
    void purchaseGameCard_invalidDenomination_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        CreateGameCardOrderRequestDto req = new CreateGameCardOrderRequestDto(
            userId,
            GamePublisher.ZING,
            new BigDecimal("15000"), // Invalid denomination
            false,
            null
        );

        assertThatThrownBy(() -> gameCardService.purchaseGameCard(req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Mệnh giá thẻ game không hợp lệ");

        verifyNoInteractions(walletServiceClient);
    }
}
