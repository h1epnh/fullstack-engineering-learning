package com.ewalletlab.investmentfundservice.service;

import com.ewalletlab.investmentfundservice.domain.InvestmentHolding;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrder;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrderType;
import com.ewalletlab.investmentfundservice.repository.InvestmentHoldingRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvestmentMutationExecutorTests {

    @Mock
    private InvestmentHoldingRepository holdingRepository;

    @Mock
    private InvestmentOrderRepository orderRepository;

    private InvestmentMutationExecutor executor;

    private final UUID userId = UUID.randomUUID();
    private final UUID fundId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        executor = new InvestmentMutationExecutor(holdingRepository, orderRepository);
    }

    @Test
    @DisplayName("recordHoldingBuyOnce: Tạo mới holding nếu chưa có và lưu order BUY")
    void recordHoldingBuyOnce_newHolding_createsAndSaves() {
        when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.empty());
        when(holdingRepository.save(any(InvestmentHolding.class))).thenAnswer(inv -> inv.getArgument(0));
        when(orderRepository.save(any(InvestmentOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal amount = new BigDecimal("100000");
        BigDecimal nav = new BigDecimal("25000");
        BigDecimal units = new BigDecimal("4.0000");

        InvestmentOrder order = executor.recordHoldingBuyOnce(userId, fundId, amount, nav, units);

        assertNotNull(order);
        assertEquals(InvestmentOrderType.BUY, order.getType());
        assertEquals(amount, order.getAmount());
        assertEquals(units, order.getUnits());
        assertEquals(nav, order.getNav());

        ArgumentCaptor<InvestmentHolding> captor = ArgumentCaptor.forClass(InvestmentHolding.class);
        verify(holdingRepository).save(captor.capture());
        assertEquals(units, captor.getValue().getUnits());
        assertEquals(new BigDecimal("100000.00"), captor.getValue().getTotalInvested());
    }

    @Test
    @DisplayName("deductUnitsOnce: Ném 409 Conflict khi chưa sở hữu holding")
    void deductUnitsOnce_noHolding_throwsConflict() {
        when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> executor.deductUnitsOnce(userId, fundId, new BigDecimal("5.0000"), new BigDecimal("25000")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("chưa sở hữu chứng chỉ quỹ"));
    }

    @Test
    @DisplayName("deductUnitsOnce: Ném 409 Conflict khi số lượng bán vượt quá số lượng sở hữu")
    void deductUnitsOnce_insufficientUnits_throwsConflict() {
        InvestmentHolding holding = new InvestmentHolding(userId, fundId);
        holding.addUnits(new BigDecimal("3.0000"), new BigDecimal("60000"));
        when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.of(holding));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> executor.deductUnitsOnce(userId, fundId, new BigDecimal("5.0000"), new BigDecimal("25000")));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertTrue(ex.getReason().contains("không đủ để bán"));
    }

    @Test
    @DisplayName("deductUnitsOnce: Thành công trừ units và lưu order SELL")
    void deductUnitsOnce_success_deductsAndSaves() {
        InvestmentHolding holding = new InvestmentHolding(userId, fundId);
        holding.addUnits(new BigDecimal("10.0000"), new BigDecimal("200000"));
        when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.of(holding));
        when(orderRepository.save(any(InvestmentOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        BigDecimal unitsToDeduct = new BigDecimal("4.0000");
        BigDecimal currentNav = new BigDecimal("25000");
        // proceeds = 4 * 25000 = 100000
        InvestmentMutationExecutor.DeductUnitsResult result = executor.deductUnitsOnce(userId, fundId, unitsToDeduct, currentNav);

        assertNotNull(result);
        assertEquals(new BigDecimal("100000"), result.proceeds());
        assertEquals(unitsToDeduct, result.unitsDeducted());
        assertEquals(new BigDecimal("6.0000"), holding.getUnits());

        verify(holdingRepository).save(holding);
        verify(orderRepository).save(any(InvestmentOrder.class));
    }

    @Test
    @DisplayName("compensateSellOnce: Bồi hoàn units cho holding và xoá order SELL tạm")
    void compensateSellOnce_restoresHoldingAndDeletesOrder() {
        InvestmentHolding holding = new InvestmentHolding(userId, fundId);
        holding.addUnits(new BigDecimal("6.0000"), new BigDecimal("120000"));
        when(holdingRepository.findByUserIdAndFundId(userId, fundId)).thenReturn(Optional.of(holding));

        UUID orderId = UUID.randomUUID();
        InvestmentOrder tempOrder = new InvestmentOrder(
            userId, fundId, InvestmentOrderType.SELL, new BigDecimal("100000"), new BigDecimal("4.0000"), new BigDecimal("25000"));
        when(orderRepository.findById(orderId)).thenReturn(Optional.of(tempOrder));

        executor.compensateSellOnce(userId, fundId, orderId, new BigDecimal("4.0000"), new BigDecimal("80000"));

        // Khôi phục 6 + 4 = 10 units
        assertEquals(new BigDecimal("10.0000"), holding.getUnits());
        assertEquals(new BigDecimal("200000.00"), holding.getTotalInvested());
        verify(holdingRepository).save(holding);
        verify(orderRepository).delete(tempOrder);
    }

    @Test
    @DisplayName("Các mutation methods phải được đánh dấu @Transactional để quản lý atomic transaction")
    void methods_haveTransactionalAnnotation() throws NoSuchMethodException {
        Method buyMethod = InvestmentMutationExecutor.class.getDeclaredMethod(
            "recordHoldingBuyOnce", UUID.class, UUID.class, BigDecimal.class, BigDecimal.class, BigDecimal.class);
        assertTrue(buyMethod.isAnnotationPresent(Transactional.class));

        Method deductMethod = InvestmentMutationExecutor.class.getDeclaredMethod(
            "deductUnitsOnce", UUID.class, UUID.class, BigDecimal.class, BigDecimal.class);
        assertTrue(deductMethod.isAnnotationPresent(Transactional.class));

        Method compMethod = InvestmentMutationExecutor.class.getDeclaredMethod(
            "compensateSellOnce", UUID.class, UUID.class, UUID.class, BigDecimal.class, BigDecimal.class);
        assertTrue(compMethod.isAnnotationPresent(Transactional.class));
    }
}
