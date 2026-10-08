package com.ewalletlab.topupservice.service;

import com.ewalletlab.topupservice.domain.TelcoOrder;
import com.ewalletlab.topupservice.domain.TelcoOrderStatus;
import com.ewalletlab.topupservice.domain.TelcoOrderType;
import com.ewalletlab.topupservice.domain.TelcoProvider;
import com.ewalletlab.topupservice.repository.TelcoOrderRepository;
import com.ewalletlab.topupservice.web.dto.CreateTelcoOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.TelcoOrderDto;
import com.ewalletlab.topupservice.web.dto.TelcoPackageDto;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TelcoServiceTests {

    @Mock
    private TelcoOrderRepository telcoOrderRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    private MockTelcoGateway mockTelcoGateway;
    private TelcoService telcoService;

    @BeforeEach
    void setUp() {
        mockTelcoGateway = new MockTelcoGateway();
        telcoService = new TelcoService(telcoOrderRepository, mockTelcoGateway, walletServiceClient);
    }

    @Test
    void getAvailablePackages_returnsAllProvidersAndDenominations() {
        List<TelcoPackageDto> packages = telcoService.getAvailablePackages();
        // 3 providers * 6 denominations = 18 packages
        assertThat(packages).hasSize(18);

        // Check Viettel 100k (2% discount -> 98,000)
        TelcoPackageDto viettel100k = packages.stream()
            .filter(p -> p.provider() == TelcoProvider.VIETTEL && p.denomination().compareTo(new BigDecimal("100000")) == 0)
            .findFirst().orElseThrow();
        assertThat(viettel100k.discountRate()).isEqualByComparingTo("0.0200");
        assertThat(viettel100k.finalPrice()).isEqualByComparingTo("98000");

        // Check Vinaphone 100k (2.5% discount -> 97,500)
        TelcoPackageDto vina100k = packages.stream()
            .filter(p -> p.provider() == TelcoProvider.VINAPHONE && p.denomination().compareTo(new BigDecimal("100000")) == 0)
            .findFirst().orElseThrow();
        assertThat(vina100k.discountRate()).isEqualByComparingTo("0.0250");
        assertThat(vina100k.finalPrice()).isEqualByComparingTo("97500");
    }

    @Test
    void createOrder_cardPin_success() {
        UUID userId = UUID.randomUUID();
        CreateTelcoOrderRequestDto request = new CreateTelcoOrderRequestDto(
            userId,
            TelcoProvider.VIETTEL,
            TelcoOrderType.CARD_PIN,
            new BigDecimal("50000"),
            null,
            false
        );

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("49000")), eq("BILL_PAYMENT"), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));

        when(telcoOrderRepository.save(any(TelcoOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TelcoOrderDto result = telcoService.createOrder(request);

        assertThat(result.status()).isEqualTo(TelcoOrderStatus.COMPLETED);
        assertThat(result.finalPrice()).isEqualByComparingTo("49000");
        assertThat(result.pinCode()).isNotBlank().hasSize(14);
        assertThat(result.serialNumber()).isNotBlank().hasSize(12);

        verify(walletServiceClient, times(1)).debit(eq(userId), eq(new BigDecimal("49000")), eq("BILL_PAYMENT"), anyString(), eq(false));
        verify(walletServiceClient, never()).credit(any(), any(), any(), any());
    }

    @Test
    void createOrder_directTopup_success() {
        UUID userId = UUID.randomUUID();
        CreateTelcoOrderRequestDto request = new CreateTelcoOrderRequestDto(
            userId,
            TelcoProvider.MOBIFONE,
            TelcoOrderType.DIRECT_TOPUP,
            new BigDecimal("100000"),
            "0901234567",
            false
        );

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("97500")), eq("BILL_PAYMENT"), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));

        when(telcoOrderRepository.save(any(TelcoOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TelcoOrderDto result = telcoService.createOrder(request);

        assertThat(result.status()).isEqualTo(TelcoOrderStatus.COMPLETED);
        assertThat(result.finalPrice()).isEqualByComparingTo("97500");
        assertThat(result.phoneNumber()).isEqualTo("0901234567");
        assertThat(result.pinCode()).isNull();
        assertThat(result.serialNumber()).isNull();

        verify(walletServiceClient, times(1)).debit(eq(userId), eq(new BigDecimal("97500")), eq("BILL_PAYMENT"), anyString(), eq(false));
        verify(walletServiceClient, never()).credit(any(), any(), any(), any());
    }

    @Test
    void createOrder_directTopup_simulatedFailure_triggersCompensatingRefund() {
        UUID userId = UUID.randomUUID();
        // 0900000000 is deterministic failure simulator
        CreateTelcoOrderRequestDto request = new CreateTelcoOrderRequestDto(
            userId,
            TelcoProvider.VIETTEL,
            TelcoOrderType.DIRECT_TOPUP,
            new BigDecimal("20000"),
            "0900000000",
            false
        );

        BigDecimal expectedFinalPrice = new BigDecimal("19600"); // 20k - 2%
        when(walletServiceClient.debit(eq(userId), eq(expectedFinalPrice), eq("BILL_PAYMENT"), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));

        when(walletServiceClient.credit(eq(userId), eq(expectedFinalPrice), eq("REFUND"), anyString()))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1019600")));

        when(telcoOrderRepository.save(any(TelcoOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TelcoOrderDto result = telcoService.createOrder(request);

        assertThat(result.status()).isEqualTo(TelcoOrderStatus.FAILED_REFUNDED);
        assertThat(result.failureReason()).contains("Thuê bao không tồn tại");

        // Verify compensating refund was called
        verify(walletServiceClient, times(1)).credit(eq(userId), eq(expectedFinalPrice), eq("REFUND"), contains("Hoàn tiền"));
    }

    @Test
    void createOrder_invalidDenomination_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        CreateTelcoOrderRequestDto request = new CreateTelcoOrderRequestDto(
            userId,
            TelcoProvider.VIETTEL,
            TelcoOrderType.CARD_PIN,
            new BigDecimal("15000"), // invalid denomination
            null,
            false
        );

        assertThatThrownBy(() -> telcoService.createOrder(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Mệnh giá nạp không hợp lệ");
    }

    @Test
    void createOrder_directTopup_invalidPhone_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        CreateTelcoOrderRequestDto request = new CreateTelcoOrderRequestDto(
            userId,
            TelcoProvider.VIETTEL,
            TelcoOrderType.DIRECT_TOPUP,
            new BigDecimal("50000"),
            "12345", // invalid phone
            false
        );

        assertThatThrownBy(() -> telcoService.createOrder(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Số điện thoại nạp không đúng định dạng");
    }
}
