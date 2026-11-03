package com.ewalletlab.walletservice;

import com.ewalletlab.walletservice.domain.CustomSpendingCategory;
import com.ewalletlab.walletservice.domain.ExternalExpenseEntry;
import com.ewalletlab.walletservice.domain.MonthlyBudget;
import com.ewalletlab.walletservice.domain.SpendingCategory;
import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionDirection;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.CustomSpendingCategoryRepository;
import com.ewalletlab.walletservice.repository.ExternalExpenseEntryRepository;
import com.ewalletlab.walletservice.repository.MonthlyBudgetRepository;
import com.ewalletlab.walletservice.repository.TransactionCategoryOverrideRepository;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.service.SpendingCategorizer;
import com.ewalletlab.walletservice.service.SpendingService;
import com.ewalletlab.walletservice.service.WalletService;
import com.ewalletlab.walletservice.web.dto.CreateCustomCategoryRequestDto;
import com.ewalletlab.walletservice.web.dto.CreateExternalExpenseRequestDto;
import com.ewalletlab.walletservice.web.dto.SetMonthlyBudgetRequestDto;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class SpendingServiceTests {

    private WalletService walletService;
    private TransactionRepository transactionRepository;
    private CustomSpendingCategoryRepository customSpendingCategoryRepository;
    private TransactionCategoryOverrideRepository categoryOverrideRepository;
    private ExternalExpenseEntryRepository externalExpenseEntryRepository;
    private MonthlyBudgetRepository monthlyBudgetRepository;
    private SpendingCategorizer spendingCategorizer;
    private SpendingService spendingService;

    @BeforeEach
    void setUp() {
        walletService = Mockito.mock(WalletService.class);
        transactionRepository = Mockito.mock(TransactionRepository.class);
        customSpendingCategoryRepository = Mockito.mock(CustomSpendingCategoryRepository.class);
        categoryOverrideRepository = Mockito.mock(TransactionCategoryOverrideRepository.class);
        externalExpenseEntryRepository = Mockito.mock(ExternalExpenseEntryRepository.class);
        monthlyBudgetRepository = Mockito.mock(MonthlyBudgetRepository.class);
        spendingCategorizer = new SpendingCategorizer();

        spendingService = new SpendingService(
            walletService,
            transactionRepository,
            customSpendingCategoryRepository,
            categoryOverrideRepository,
            externalExpenseEntryRepository,
            monthlyBudgetRepository,
            spendingCategorizer
        );
    }

    @Test
    void testKeywordCategorization() {
        assertEquals(SpendingCategory.FOOD_DRINK, spendingCategorizer.categorizeByNote("Ăn trưa cơm tấm"));
        assertEquals(SpendingCategory.FOOD_DRINK, spendingCategorizer.categorizeByNote("Cà phê highlands sáng"));
        assertEquals(SpendingCategory.TRANSPORT, spendingCategorizer.categorizeByNote("Đổ xăng xe máy"));
        assertEquals(SpendingCategory.TRANSPORT, spendingCategorizer.categorizeByNote("GrabCar đi làm"));
        assertEquals(SpendingCategory.SHOPPING, spendingCategorizer.categorizeByNote("Mua sắm shopee"));
        assertEquals(SpendingCategory.ENTERTAINMENT, spendingCategorizer.categorizeByNote("Vé xem phim CGV"));
        assertEquals(SpendingCategory.HEALTH_EDU, spendingCategorizer.categorizeByNote("Mua thuốc cảm"));
        assertEquals(SpendingCategory.INVESTMENT, spendingCategorizer.categorizeByNote("Tích luỹ tiền vàng"));
        assertEquals(SpendingCategory.BILLS, spendingCategorizer.categorizeByNote("Tiền điện sinh hoạt"));
        assertEquals(SpendingCategory.OTHER, spendingCategorizer.categorizeByNote("Chuyển tiền bạn bè mượn"));
    }

    @Test
    void testGetSpendingReportWithAutoCategorizationAndExternalExpenses() {
        UUID userId = UUID.randomUUID();
        UUID walletId = UUID.randomUUID();
        Wallet wallet = new Wallet(userId);

        when(walletService.getOrCreateWallet(eq(userId))).thenReturn(wallet);

        // 1 giao dịch trong ví: 50.000đ ăn bún bò
        Transaction tx1 = new Transaction(
            wallet.getId(), TransactionType.TRANSFER_OUT,
            new BigDecimal("50000"), "0987654321", "Ăn sáng bún bò"
        );

        when(transactionRepository.findByWalletIdAndTypeInAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(any(), any(), any()))
            .thenReturn(List.of(tx1));
        when(categoryOverrideRepository.findByUserId(eq(userId))).thenReturn(List.of());
        when(customSpendingCategoryRepository.findByUserIdOrderByCreatedAtAsc(eq(userId))).thenReturn(List.of());

        // 1 khoản chi tiền mặt ngoài ví: 30.000đ đổ xăng
        ExternalExpenseEntry ext1 = new ExternalExpenseEntry(
            userId, new BigDecimal("30000"), "TRANSPORT", "Đổ xăng xe máy", Instant.now()
        );
        when(externalExpenseEntryRepository.findByUserIdAndSpentAtGreaterThanEqualOrderBySpentAtDesc(eq(userId), any()))
            .thenReturn(List.of(ext1));

        SpendingReportResponse report = spendingService.getSpendingReport(userId, "month");

        assertNotNull(report);
        assertEquals(new BigDecimal("80000"), report.total());
        assertEquals(new BigDecimal("50000"), report.inWalletTotal());
        assertEquals(new BigDecimal("30000"), report.externalTotal());

        // Kiểm tra breakdown 2 categories: FOOD_DRINK (50k) và TRANSPORT (30k)
        assertEquals(2, report.categoryBreakdown().size());
        assertEquals("FOOD_DRINK", report.categoryBreakdown().get(0).categoryCode());
        assertEquals(new BigDecimal("50000"), report.categoryBreakdown().get(0).amount());
        assertEquals("TRANSPORT", report.categoryBreakdown().get(1).categoryCode());
        assertEquals(new BigDecimal("30000"), report.categoryBreakdown().get(1).amount());
    }

    @Test
    void testTransactionCategoryOverride() {
        UUID userId = UUID.randomUUID();
        UUID txId = UUID.randomUUID();

        when(categoryOverrideRepository.findByUserIdAndTransactionId(eq(userId), eq(txId)))
            .thenReturn(Optional.empty());

        spendingService.setTransactionCategory(userId, txId, "SHOPPING");

        Mockito.verify(categoryOverrideRepository).save(any());
    }

    @Test
    void testCreateCustomCategory() {
        UUID userId = UUID.randomUUID();
        CreateCustomCategoryRequestDto req = new CreateCustomCategoryRequestDto(
            "PETS", "Thú cưng", "pets", "#ec4899"
        );

        when(customSpendingCategoryRepository.findByUserIdAndCode(eq(userId), eq("PETS")))
            .thenReturn(Optional.empty());
        when(customSpendingCategoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var created = spendingService.createCustomCategory(userId, req);

        assertNotNull(created);
        assertEquals("PETS", created.code());
        assertEquals("Thú cưng", created.name());
        assertTrue(created.isCustom());
    }

    @Test
    void testBudgetEvaluationStatusSafeAndWarning() {
        UUID userId = UUID.randomUUID();
        String currentMonth = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("MM/yyyy"));
        Wallet wallet = new Wallet(userId);
        when(walletService.getOrCreateWallet(eq(userId))).thenReturn(wallet);

        // Giả lập chi tiêu trong tháng là 850.000đ cho FOOD_DRINK
        Transaction tx = new Transaction(
            wallet.getId(), TransactionType.TRANSFER_OUT,
            new BigDecimal("850000"), "0987654321", "Ăn uống tổng hợp"
        );
        when(transactionRepository.findByWalletIdAndTypeInAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(any(), any(), any()))
            .thenReturn(List.of(tx));
        when(categoryOverrideRepository.findByUserId(eq(userId))).thenReturn(List.of());
        when(externalExpenseEntryRepository.findByUserIdAndSpentAtGreaterThanEqualOrderBySpentAtDesc(eq(userId), any()))
            .thenReturn(List.of());

        // Ngân sách 1.000.000đ -> 850.000đ tương đương 85% (ngưỡng WARNING_80)
        MonthlyBudget budget = new MonthlyBudget(userId, currentMonth, "FOOD_DRINK", new BigDecimal("1000000"));
        when(monthlyBudgetRepository.findByUserIdAndMonth(eq(userId), eq(currentMonth)))
            .thenReturn(List.of(budget));

        var budgets = spendingService.getBudgets(userId, currentMonth);

        assertEquals(1, budgets.size());
        assertEquals("WARNING_80", budgets.get(0).status());
        assertEquals(85.0, budgets.get(0).percentage());
    }
}
