package com.ewalletlab.billpaymentservice;

import com.ewalletlab.billpaymentservice.domain.InsurancePolicy;
import com.ewalletlab.billpaymentservice.domain.PolicyStatus;
import com.ewalletlab.billpaymentservice.repository.InsurancePolicyRepository;
import com.ewalletlab.billpaymentservice.service.InsuranceService;
import com.ewalletlab.billpaymentservice.service.WalletServiceClient;
import com.ewalletlab.billpaymentservice.web.dto.BuyPolicyRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.InsurancePolicyDto;
import com.ewalletlab.billpaymentservice.web.dto.InsuranceProductDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InsuranceServiceTests {

    @Mock
    private InsurancePolicyRepository repository;

    @Mock
    private WalletServiceClient walletServiceClient;

    private InsuranceService service;

    @BeforeEach
    void setUp() {
        service = new InsuranceService(repository, walletServiceClient);
    }

    @Test
    void getProducts_returnsCatalog() {
        List<InsuranceProductDto> products = service.getProducts();
        assertThat(products).hasSize(2);
        assertThat(products.get(0).productCode()).isEqualTo("MOTORCYCLE_TNDS");
        assertThat(products.get(1).productCode()).isEqualTo("PERSONAL_ACCIDENT_BASIC");
    }

    @Test
    void buyPolicy_motorcycle_requiresVehiclePlate() {
        UUID userId = UUID.randomUUID();
        BuyPolicyRequestDto req = new BuyPolicyRequestDto(
            userId, "MOTORCYCLE_TNDS", "Nguyen Van A", "012345678901", ""
        );

        assertThatThrownBy(() -> service.buyPolicy(req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("biển số xe");

        verifyNoInteractions(walletServiceClient);
    }

    @Test
    void buyPolicy_motorcycle_success() {
        UUID userId = UUID.randomUUID();
        BuyPolicyRequestDto req = new BuyPolicyRequestDto(
            userId, "MOTORCYCLE_TNDS", "Nguyen Van A", "012345678901", "29A1-123.45"
        );

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("66000")), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("1000000")));
        when(repository.save(any(InsurancePolicy.class))).thenAnswer(inv -> inv.getArgument(0));

        InsurancePolicyDto result = service.buyPolicy(req);

        assertThat(result.productCode()).isEqualTo("MOTORCYCLE_TNDS");
        assertThat(result.premiumAmount()).isEqualByComparingTo("66000");
        assertThat(result.coverageAmount()).isEqualByComparingTo("150000000");
        assertThat(result.certificateNumber()).startsWith("BH-XM-");
        assertThat(result.status()).isEqualTo(PolicyStatus.ACTIVE);
        assertThat(result.expiryDate()).isEqualTo(LocalDate.now().plusYears(1));

        verify(walletServiceClient).debit(eq(userId), eq(new BigDecimal("66000")), anyString(), anyString(), eq(false));
        verify(repository).save(any(InsurancePolicy.class));
    }

    @Test
    void buyPolicy_personalAccident_success() {
        UUID userId = UUID.randomUUID();
        BuyPolicyRequestDto req = new BuyPolicyRequestDto(
            userId, "PERSONAL_ACCIDENT_BASIC", "Tran Thi B", "098765432109", null
        );

        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("30000")), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("500000")));
        when(repository.save(any(InsurancePolicy.class))).thenAnswer(inv -> inv.getArgument(0));

        InsurancePolicyDto result = service.buyPolicy(req);

        assertThat(result.productCode()).isEqualTo("PERSONAL_ACCIDENT_BASIC");
        assertThat(result.premiumAmount()).isEqualByComparingTo("30000");
        assertThat(result.coverageAmount()).isEqualByComparingTo("20000000");
        assertThat(result.certificateNumber()).startsWith("BH-TN-");
        assertThat(result.status()).isEqualTo(PolicyStatus.ACTIVE);
        assertThat(result.expiryDate()).isEqualTo(LocalDate.now().plusDays(30));

        verify(walletServiceClient).debit(eq(userId), eq(new BigDecimal("30000")), anyString(), anyString(), eq(false));
    }

    @Test
    void buyPolicy_insufficientFunds_throwsConflict() {
        UUID userId = UUID.randomUUID();
        BuyPolicyRequestDto req = new BuyPolicyRequestDto(
            userId, "MOTORCYCLE_TNDS", "Nguyen Van A", "012345678901", "29A1-123.45"
        );

        when(walletServiceClient.debit(any(), any(), any(), any(), eq(false)))
            .thenThrow(new HttpClientErrorException(HttpStatus.CONFLICT, "Số dư không đủ"));

        assertThatThrownBy(() -> service.buyPolicy(req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Số dư ví không đủ để thanh toán bảo hiểm");

        verify(repository, never()).save(any());
    }
}
