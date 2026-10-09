package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.BillCategory;
import com.ewalletlab.billpaymentservice.domain.BillPayment;
import com.ewalletlab.billpaymentservice.domain.DigitalSubscriptionOrder;
import com.ewalletlab.billpaymentservice.repository.BillPaymentRepository;
import com.ewalletlab.billpaymentservice.repository.DigitalSubscriptionRepository;
import com.ewalletlab.billpaymentservice.web.dto.DigitalServicePackageDto;
import com.ewalletlab.billpaymentservice.web.dto.DigitalSubscriptionOrderDto;
import com.ewalletlab.billpaymentservice.web.dto.SubscribeDigitalServiceRequestDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class DigitalSubscriptionServiceTests {

    @Mock
    private DigitalSubscriptionRepository subscriptionRepository;

    @Mock
    private BillPaymentRepository billPaymentRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    private DigitalSubscriptionService service;

    @BeforeEach
    void setUp() {
        service = new DigitalSubscriptionService(subscriptionRepository, billPaymentRepository, walletServiceClient);
    }

    @Test
    void getCatalog_returnsAllFivePackages() {
        List<DigitalServicePackageDto> catalog = service.getCatalog();
        assertThat(catalog).hasSize(5);

        DigitalServicePackageDto spotify = catalog.stream()
            .filter(p -> "SPOTIFY_PREMIUM_1M".equals(p.packageCode()))
            .findFirst().orElseThrow();
        assertThat(spotify.price()).isEqualByComparingTo("59000");
        assertThat(spotify.category()).isEqualTo(BillCategory.ENTERTAINMENT_STREAMING);

        DigitalServicePackageDto googlePlay = catalog.stream()
            .filter(p -> "GOOGLE_PLAY_CODE_100K".equals(p.packageCode()))
            .findFirst().orElseThrow();
        assertThat(googlePlay.price()).isEqualByComparingTo("100000");
        assertThat(googlePlay.category()).isEqualTo(BillCategory.APP_STORE_CODE);
    }

    @Test
    void subscribe_spotify_success() {
        UUID userId = UUID.randomUUID();
        SubscribeDigitalServiceRequestDto request = new SubscribeDigitalServiceRequestDto(
            userId,
            "SPOTIFY_PREMIUM_1M",
            "user@spotify.com",
            false
        );

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("59000")), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));

        when(billPaymentRepository.save(any(BillPayment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionRepository.save(any(DigitalSubscriptionOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DigitalSubscriptionOrderDto result = service.subscribe(request);

        assertThat(result.packageCode()).isEqualTo("SPOTIFY_PREMIUM_1M");
        assertThat(result.packageName()).contains("Spotify");
        assertThat(result.price()).isEqualByComparingTo("59000");
        assertThat(result.accountIdentifier()).isEqualTo("user@spotify.com");
        assertThat(result.activationCode()).startsWith("SPTI-").hasSize(14); // SPTI-XXXX-XXXX
        assertThat(result.status()).isEqualTo("COMPLETED");

        verify(walletServiceClient, times(1)).debit(eq(userId), eq(new BigDecimal("59000")), contains("Spotify"), eq(false));
        verify(billPaymentRepository, times(1)).save(any(BillPayment.class));
        verify(subscriptionRepository, times(1)).save(any(DigitalSubscriptionOrder.class));
    }

    @Test
    void subscribe_invalidPackage_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        SubscribeDigitalServiceRequestDto request = new SubscribeDigitalServiceRequestDto(
            userId,
            "NON_EXISTENT_PACKAGE",
            "test@email.com",
            false
        );

        assertThatThrownBy(() -> service.subscribe(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Gói dịch vụ số không tồn tại");
    }

    @Test
    void subscribe_blankAccountIdentifier_throwsBadRequest() {
        UUID userId = UUID.randomUUID();
        SubscribeDigitalServiceRequestDto request = new SubscribeDigitalServiceRequestDto(
            userId,
            "SPOTIFY_PREMIUM_1M",
            "   ",
            false
        );

        assertThatThrownBy(() -> service.subscribe(request))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Tài khoản thụ hưởng");
    }
}
