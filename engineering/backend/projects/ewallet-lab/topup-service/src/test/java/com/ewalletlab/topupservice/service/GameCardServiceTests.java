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
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
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
            false
        );

        when(gameCardOrderRepository.save(any(GameCardOrder.class)))
            .thenAnswer(inv -> inv.getArgument(0));

        GameCardOrderDto order = gameCardService.purchaseGameCard(req);

        // Verify debit call with finalPrice 97,000 (3% discount)
        verify(walletServiceClient).debit(
            eq(userId),
            eq(new BigDecimal("97000")),
            eq("BILL_PAYMENT"),
            contains("Garena"),
            eq(false)
        );

        assertThat(order.denomination()).isEqualByComparingTo("100000");
        assertThat(order.finalPrice()).isEqualByComparingTo("97000");
        assertThat(order.discountRate()).isEqualByComparingTo("0.0300");
        assertThat(order.pinCode()).isNotBlank();
        assertThat(order.serialNumber()).isNotBlank();
        assertThat(order.expiryDate()).isEqualTo("31/12/2027");

        ArgumentCaptor<GameCardOrder> captor = ArgumentCaptor.forClass(GameCardOrder.class);
        verify(gameCardOrderRepository).save(captor.capture());
        assertThat(captor.getValue().getPublisher()).isEqualTo(GamePublisher.GARENA);
    }

    @Test
    void purchaseGameCard_invalidDenomination_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        CreateGameCardOrderRequestDto req = new CreateGameCardOrderRequestDto(
            userId,
            GamePublisher.ZING,
            new BigDecimal("15000"), // Invalid denomination
            false
        );

        assertThatThrownBy(() -> gameCardService.purchaseGameCard(req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Mệnh giá thẻ game không hợp lệ");

        verifyNoInteractions(walletServiceClient);
    }
}
