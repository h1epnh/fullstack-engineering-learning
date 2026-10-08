package com.ewalletlab.investmentfundservice.service;

import com.ewalletlab.investmentfundservice.domain.InvestmentHolding;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrder;
import com.ewalletlab.investmentfundservice.domain.InvestmentOrderType;
import com.ewalletlab.investmentfundservice.repository.InvestmentHoldingRepository;
import com.ewalletlab.investmentfundservice.repository.InvestmentOrderRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Executes isolated transactional operations on InvestmentHolding and InvestmentOrder.
 * Separated from InvestmentFundService to ensure Spring @Transactional proxy creates a fresh
 * transaction on each optimistic locking retry.
 */
@Component
public class InvestmentMutationExecutor {

    private final InvestmentHoldingRepository holdingRepository;
    private final InvestmentOrderRepository orderRepository;

    public InvestmentMutationExecutor(InvestmentHoldingRepository holdingRepository,
                                      InvestmentOrderRepository orderRepository) {
        this.holdingRepository = holdingRepository;
        this.orderRepository = orderRepository;
    }

    public record DeductUnitsResult(UUID orderId, BigDecimal proceeds, BigDecimal unitsDeducted,
                                    BigDecimal investedReduction) {
    }

    @Transactional
    public InvestmentOrder recordHoldingBuyOnce(UUID userId, UUID fundId, BigDecimal amount,
                                                BigDecimal nav, BigDecimal units) {
        InvestmentHolding holding = holdingRepository.findByUserIdAndFundId(userId, fundId)
            .orElseGet(() -> new InvestmentHolding(userId, fundId));

        holding.addUnits(units, amount);
        holdingRepository.save(holding);

        InvestmentOrder order = new InvestmentOrder(userId, fundId, InvestmentOrderType.BUY, amount, units, nav);
        return orderRepository.save(order);
    }

    @Transactional
    public DeductUnitsResult deductUnitsOnce(UUID userId, UUID fundId, BigDecimal unitsToDeduct,
                                             BigDecimal currentNav) {
        InvestmentHolding holding = holdingRepository.findByUserIdAndFundId(userId, fundId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                "Bạn chưa sở hữu chứng chỉ quỹ này"));

        if (holding.getUnits().compareTo(unitsToDeduct) < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Số lượng chứng chỉ quỹ nắm giữ không đủ để bán (hiện có %s đơn vị)".formatted(holding.getUnits()));
        }

        BigDecimal investedReduction = holding.deductUnits(unitsToDeduct);
        holdingRepository.save(holding);

        BigDecimal proceeds = unitsToDeduct.multiply(currentNav).setScale(0, RoundingMode.HALF_UP);
        InvestmentOrder order = new InvestmentOrder(userId, fundId, InvestmentOrderType.SELL, proceeds, unitsToDeduct, currentNav);
        orderRepository.save(order);

        return new DeductUnitsResult(order.getId(), proceeds, unitsToDeduct, investedReduction);
    }

    @Transactional
    public void compensateSellOnce(UUID userId, UUID fundId, UUID orderId, BigDecimal unitsToRestore,
                                   BigDecimal investedToRestore) {
        holdingRepository.findByUserIdAndFundId(userId, fundId).ifPresent(holding -> {
            holding.restoreDeduction(unitsToRestore, investedToRestore);
            holdingRepository.save(holding);
        });
        orderRepository.findById(orderId).ifPresent(orderRepository::delete);
    }
}

