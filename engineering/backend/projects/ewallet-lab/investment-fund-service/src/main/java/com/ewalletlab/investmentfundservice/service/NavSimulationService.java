package com.ewalletlab.investmentfundservice.service;

import com.ewalletlab.investmentfundservice.domain.InvestmentFund;
import com.ewalletlab.investmentfundservice.domain.NavHistory;
import com.ewalletlab.investmentfundservice.repository.InvestmentFundRepository;
import com.ewalletlab.investmentfundservice.repository.NavHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
public class NavSimulationService {

    private static final Logger log = LoggerFactory.getLogger(NavSimulationService.class);

    private final InvestmentFundRepository fundRepository;
    private final NavHistoryRepository historyRepository;
    private final Random random = new Random();

    @Value("${ewallet-lab.investment.nav-volatility-pct:0.05}")
    private double maxVolatilityPct;

    public NavSimulationService(InvestmentFundRepository fundRepository,
                                NavHistoryRepository historyRepository) {
        this.fundRepository = fundRepository;
        this.historyRepository = historyRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedInitialFundsIfEmpty() {
        if (fundRepository.count() > 0) {
            return;
        }

        List<InvestmentFund> defaultFunds = List.of(
            new InvestmentFund(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                "VF-GROWTH",
                "Quỹ Cổ Phiếu Tăng Trưởng",
                "Mô phỏng quỹ mở tập trung cổ phiếu tăng trưởng. Lợi nhuận tiềm năng cao đi kèm rủi ro biến động lớn.",
                new BigDecimal("15000.0000")
            ),
            new InvestmentFund(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                "VF-BALANCED",
                "Quỹ Cân Bằng Năng Động",
                "Mô phỏng quỹ mở cân bằng 50% cổ phiếu và 50% trái phiếu. Cân bằng giữa tăng trưởng vốn và kiểm soát rủi ro.",
                new BigDecimal("12000.0000")
            ),
            new InvestmentFund(
                UUID.fromString("33333333-3333-3333-3333-333333333333"),
                "VF-BOND",
                "Quỹ Trái Phiếu An Toàn",
                "Mô phỏng quỹ mở đầu tư trái phiếu chính phủ và tiền gửi ngân hàng. Biến động thấp, ổn định.",
                new BigDecimal("10500.0000")
            )
        );

        for (InvestmentFund fund : defaultFunds) {
            fundRepository.save(fund);
            historyRepository.save(new NavHistory(fund.getId(), fund.getNav()));
        }
        log.info("Đã khởi tạo {} quỹ đầu tư mô phỏng mặc định", defaultFunds.size());
    }

    /**
     * Ticks all funds: NAV randomly moves UP or DOWN within maxVolatilityPct.
     * Guaranteed to allow NAV decrease as well as increase.
     */
    @Transactional
    public List<InvestmentFund> tickAllFunds() {
        List<InvestmentFund> funds = fundRepository.findAll();
        for (InvestmentFund fund : funds) {
            // Factor between -maxVolatilityPct and +maxVolatilityPct
            double changePct = (random.nextDouble() * 2 - 1) * maxVolatilityPct;
            BigDecimal currentNav = fund.getNav();
            BigDecimal delta = currentNav.multiply(BigDecimal.valueOf(changePct));
            BigDecimal newNav = currentNav.add(delta).setScale(4, RoundingMode.HALF_UP);
            if (newNav.compareTo(new BigDecimal("100.0000")) < 0) {
                newNav = new BigDecimal("100.0000");
            }
            fund.setNav(newNav);
            fundRepository.save(fund);
            historyRepository.save(new NavHistory(fund.getId(), newNav));
        }
        return funds;
    }

    /**
     * Sets exact NAV for deterministic testing (e.g. testing NAV drop / loss scenario).
     */
    @Transactional
    public InvestmentFund setFundNav(UUID fundId, BigDecimal newNav) {
        InvestmentFund fund = fundRepository.findById(fundId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quỹ với ID " + fundId));
        fund.setNav(newNav.setScale(4, RoundingMode.HALF_UP));
        fundRepository.save(fund);
        historyRepository.save(new NavHistory(fund.getId(), fund.getNav()));
        return fund;
    }

    @Scheduled(fixedDelayString = "${ewallet-lab.investment.nav-update-interval-millis:60000}", initialDelay = 60000)
    public void scheduledTick() {
        tickAllFunds();
    }
}

