package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.CustomSpendingCategory;
import com.ewalletlab.walletservice.domain.ExternalExpenseEntry;
import com.ewalletlab.walletservice.domain.MonthlyBudget;
import com.ewalletlab.walletservice.domain.SpendingCategory;
import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionCategoryOverride;
import com.ewalletlab.walletservice.domain.TransactionType;
import com.ewalletlab.walletservice.domain.Wallet;
import com.ewalletlab.walletservice.repository.CustomSpendingCategoryRepository;
import com.ewalletlab.walletservice.repository.ExternalExpenseEntryRepository;
import com.ewalletlab.walletservice.repository.MonthlyBudgetRepository;
import com.ewalletlab.walletservice.repository.TransactionCategoryOverrideRepository;
import com.ewalletlab.walletservice.repository.TransactionRepository;
import com.ewalletlab.walletservice.web.dto.CategoryBreakdownItemDto;
import com.ewalletlab.walletservice.web.dto.CreateCustomCategoryRequestDto;
import com.ewalletlab.walletservice.web.dto.CreateExternalExpenseRequestDto;
import com.ewalletlab.walletservice.web.dto.ExternalExpenseDto;
import com.ewalletlab.walletservice.web.dto.MonthlyBudgetDto;
import com.ewalletlab.walletservice.web.dto.SetMonthlyBudgetRequestDto;
import com.ewalletlab.walletservice.web.dto.SpendingCategoryDto;
import com.ewalletlab.walletservice.web.dto.SpendingReportResponse;
import com.ewalletlab.walletservice.web.dto.SpendingTransactionItemDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SpendingService {

    private static final Logger log = LoggerFactory.getLogger(SpendingService.class);
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final Set<TransactionType> SPEND_TYPES =
        EnumSet.of(TransactionType.WITHDRAW, TransactionType.TRANSFER_OUT, TransactionType.BILL_PAYMENT);

    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final CustomSpendingCategoryRepository customSpendingCategoryRepository;
    private final TransactionCategoryOverrideRepository categoryOverrideRepository;
    private final ExternalExpenseEntryRepository externalExpenseEntryRepository;
    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final SpendingCategorizer spendingCategorizer;

    public SpendingService(WalletService walletService,
                           TransactionRepository transactionRepository,
                           CustomSpendingCategoryRepository customSpendingCategoryRepository,
                           TransactionCategoryOverrideRepository categoryOverrideRepository,
                           ExternalExpenseEntryRepository externalExpenseEntryRepository,
                           MonthlyBudgetRepository monthlyBudgetRepository,
                           SpendingCategorizer spendingCategorizer) {
        this.walletService = walletService;
        this.transactionRepository = transactionRepository;
        this.customSpendingCategoryRepository = customSpendingCategoryRepository;
        this.categoryOverrideRepository = categoryOverrideRepository;
        this.externalExpenseEntryRepository = externalExpenseEntryRepository;
        this.monthlyBudgetRepository = monthlyBudgetRepository;
        this.spendingCategorizer = spendingCategorizer;
    }

    /**
     * Báo cáo chi tiêu cá nhân PFM 2.0 (Issue #88 & Issue #16).
     * Tổng hợp đa chiều theo 8 danh mục chuẩn và danh mục tuỳ chỉnh, gộp cả chi tiêu trong ví và ngoài ví.
     */
    public SpendingReportResponse getSpendingReport(UUID userId, String period) {
        Instant periodStart = switch (period != null ? period.toLowerCase(Locale.ROOT) : "") {
            case "week" -> currentWeekStart();
            case "month" -> currentMonthStart();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "period phải là 'week' hoặc 'month'");
        };

        Wallet wallet = walletService.getOrCreateWallet(userId);

        // 1. Lấy danh sách giao dịch trong ví
        List<Transaction> inWalletTxs = transactionRepository
            .findByWalletIdAndTypeInAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(wallet.getId(), SPEND_TYPES, periodStart);

        // 2. Lấy overrides và custom categories
        Map<UUID, String> overrides = categoryOverrideRepository.findByUserId(userId).stream()
            .collect(Collectors.toMap(TransactionCategoryOverride::getTransactionId, TransactionCategoryOverride::getCategoryCode, (a, b) -> b));

        Map<String, CustomSpendingCategory> customCategories = customSpendingCategoryRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
            .collect(Collectors.toMap(CustomSpendingCategory::getCode, c -> c, (a, b) -> b));

        // 3. Lấy chi tiêu ngoài ví (tiền mặt)
        List<ExternalExpenseEntry> externalExpenses = externalExpenseEntryRepository
            .findByUserIdAndSpentAtGreaterThanEqualOrderBySpentAtDesc(userId, periodStart);

        // Chuẩn bị tổng hợp
        Map<TransactionType, BigDecimal> typeBreakdown = new EnumMap<>(TransactionType.class);
        for (TransactionType type : SPEND_TYPES) {
            typeBreakdown.put(type, BigDecimal.ZERO);
        }

        BigDecimal inWalletTotal = BigDecimal.ZERO;
        BigDecimal externalTotal = BigDecimal.ZERO;

        List<SpendingTransactionItemDto> transactionItems = new ArrayList<>();
        Map<String, BigDecimal> categoryTotals = new HashMap<>();
        Map<String, Integer> categoryTxCounts = new HashMap<>();

        // Xử lý giao dịch trong ví
        for (Transaction tx : inWalletTxs) {
            inWalletTotal = inWalletTotal.add(tx.getAmount());
            typeBreakdown.put(tx.getType(), typeBreakdown.getOrDefault(tx.getType(), BigDecimal.ZERO).add(tx.getAmount()));

            String catCode = overrides.get(tx.getId());
            if (catCode == null) {
                catCode = spendingCategorizer.categorize(tx).getCode();
            }

            CategoryMeta meta = resolveCategoryMeta(catCode, customCategories);

            categoryTotals.put(meta.code(), categoryTotals.getOrDefault(meta.code(), BigDecimal.ZERO).add(tx.getAmount()));
            categoryTxCounts.put(meta.code(), categoryTxCounts.getOrDefault(meta.code(), 0) + 1);

            transactionItems.add(new SpendingTransactionItemDto(
                tx.getId(),
                "WALLET",
                tx.getAmount(),
                meta.code(),
                meta.name(),
                meta.icon(),
                meta.color(),
                tx.getNote(),
                tx.getCreatedAt()
            ));
        }

        // Xử lý giao dịch ngoài ví (tiền mặt)
        for (ExternalExpenseEntry ext : externalExpenses) {
            externalTotal = externalTotal.add(ext.getAmount());

            String catCode = ext.getCategoryCode();
            CategoryMeta meta = resolveCategoryMeta(catCode, customCategories);

            categoryTotals.put(meta.code(), categoryTotals.getOrDefault(meta.code(), BigDecimal.ZERO).add(ext.getAmount()));
            categoryTxCounts.put(meta.code(), categoryTxCounts.getOrDefault(meta.code(), 0) + 1);

            transactionItems.add(new SpendingTransactionItemDto(
                ext.getId(),
                "CASH",
                ext.getAmount(),
                meta.code(),
                meta.name(),
                meta.icon(),
                meta.color(),
                ext.getNote(),
                ext.getSpentAt()
            ));
        }

        // Sắp xếp items theo thời gian giảm dần
        transactionItems.sort(Comparator.comparing(SpendingTransactionItemDto::spentAt).reversed());

        BigDecimal grandTotal = inWalletTotal.add(externalTotal);

        // Xây dựng category breakdown
        List<CategoryBreakdownItemDto> categoryBreakdown = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            String code = entry.getKey();
            BigDecimal amount = entry.getValue();
            CategoryMeta meta = resolveCategoryMeta(code, customCategories);

            double percentage = 0.0;
            if (grandTotal.signum() > 0) {
                percentage = amount.multiply(BigDecimal.valueOf(100))
                    .divide(grandTotal, 1, RoundingMode.HALF_UP)
                    .doubleValue();
            }

            categoryBreakdown.add(new CategoryBreakdownItemDto(
                meta.code(),
                meta.name(),
                meta.icon(),
                meta.color(),
                amount,
                percentage,
                categoryTxCounts.getOrDefault(code, 0)
            ));
        }

        // Sắp xếp theo amount giảm dần
        categoryBreakdown.sort(Comparator.comparing(CategoryBreakdownItemDto::amount).reversed());

        return new SpendingReportResponse(
            period,
            periodStart,
            grandTotal,
            typeBreakdown,
            inWalletTotal,
            externalTotal,
            categoryBreakdown,
            transactionItems
        );
    }

    /**
     * Gán đè danh mục PFM cho giao dịch trong ví.
     */
    @Transactional
    public void setTransactionCategory(UUID userId, UUID transactionId, String categoryCode) {
        if (categoryCode == null || categoryCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "categoryCode không được để trống");
        }

        Optional<TransactionCategoryOverride> existing = categoryOverrideRepository
            .findByUserIdAndTransactionId(userId, transactionId);

        if (existing.isPresent()) {
            TransactionCategoryOverride override = existing.get();
            override.setCategoryCode(categoryCode);
            categoryOverrideRepository.save(override);
        } else {
            TransactionCategoryOverride override = new TransactionCategoryOverride(userId, transactionId, categoryCode);
            categoryOverrideRepository.save(override);
        }
    }

    /**
     * Lấy danh mục tất cả gồm 8 danh mục chuẩn + danh mục tuỳ chỉnh của user.
     */
    public List<SpendingCategoryDto> getAvailableCategories(UUID userId) {
        List<SpendingCategoryDto> list = new ArrayList<>();

        for (SpendingCategory c : SpendingCategory.values()) {
            list.add(new SpendingCategoryDto(c.getCode(), c.getName(), c.getIcon(), c.getColor(), false));
        }

        List<CustomSpendingCategory> customs = customSpendingCategoryRepository.findByUserIdOrderByCreatedAtAsc(userId);
        for (CustomSpendingCategory cust : customs) {
            list.add(new SpendingCategoryDto(cust.getCode(), cust.getName(), cust.getIcon(), cust.getColor(), true));
        }

        return list;
    }

    /**
     * Tạo danh mục chi tiêu tuỳ chỉnh mới.
     */
    @Transactional
    public SpendingCategoryDto createCustomCategory(UUID userId, CreateCustomCategoryRequestDto req) {
        String code = req.code().trim().toUpperCase(Locale.ROOT);

        // Không cho phép trùng với 8 category chuẩn
        for (SpendingCategory c : SpendingCategory.values()) {
            if (c.getCode().equalsIgnoreCase(code)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã danh mục đã trùng với danh mục hệ thống: " + code);
            }
        }

        if (customSpendingCategoryRepository.findByUserIdAndCode(userId, code).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã tạo danh mục với mã này trước đó: " + code);
        }

        CustomSpendingCategory saved = customSpendingCategoryRepository.save(
            new CustomSpendingCategory(userId, code, req.name(), req.icon(), req.color())
        );

        return new SpendingCategoryDto(saved.getCode(), saved.getName(), saved.getIcon(), saved.getColor(), true);
    }

    /**
     * Ghi chép chi tiêu tiền mặt ngoài ví (ExternalExpenseEntry).
     */
    @Transactional
    public ExternalExpenseDto createExternalExpense(UUID userId, CreateExternalExpenseRequestDto req) {
        ExternalExpenseEntry entry = new ExternalExpenseEntry(
            userId, req.amount(), req.categoryCode(), req.note(), req.spentAt()
        );
        ExternalExpenseEntry saved = externalExpenseEntryRepository.save(entry);

        // Kiểm tra ngưỡng ngân sách tháng hiện tại
        checkAndAlertBudget(userId, req.categoryCode());

        return ExternalExpenseDto.from(saved);
    }

    /**
     * Xoá khoản chi ngoài ví.
     */
    @Transactional
    public void deleteExternalExpense(UUID userId, UUID expenseId) {
        ExternalExpenseEntry entry = externalExpenseEntryRepository.findById(expenseId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khoản chi tiêu"));

        if (!entry.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền xoá khoản chi của người khác");
        }

        externalExpenseEntryRepository.delete(entry);
    }

    public List<ExternalExpenseDto> getExternalExpenses(UUID userId) {
        return externalExpenseEntryRepository.findByUserIdOrderBySpentAtDesc(userId).stream()
            .map(ExternalExpenseDto::from)
            .toList();
    }

    /**
     * Thiết lập ngân sách tháng (MonthlyBudget).
     */
    @Transactional
    public MonthlyBudgetDto setBudget(UUID userId, SetMonthlyBudgetRequestDto req) {
        String month = req.month().trim();
        String catCode = req.categoryCode() != null && !req.categoryCode().isBlank()
            ? req.categoryCode().trim().toUpperCase(Locale.ROOT)
            : "ALL";

        Optional<MonthlyBudget> existing = monthlyBudgetRepository.findByUserIdAndMonthAndCategoryCode(userId, month, catCode);
        MonthlyBudget budget;
        if (existing.isPresent()) {
            budget = existing.get();
            budget.setBudgetLimit(req.budgetLimit());
            // Reset flags nếu limit thay đổi
            budget.setAlertTriggered80(false);
            budget.setAlertTriggered100(false);
            budget = monthlyBudgetRepository.save(budget);
        } else {
            budget = new MonthlyBudget(userId, month, catCode, req.budgetLimit());
            budget = monthlyBudgetRepository.save(budget);
        }

        return toBudgetDto(userId, budget);
    }

    /**
     * Lấy danh sách ngân sách tháng kèm tỷ lệ đã chi tiêu.
     */
    public List<MonthlyBudgetDto> getBudgets(UUID userId, String month) {
        String m = month != null && !month.isBlank() ? month.trim() : LocalDate.now().format(MONTH_FORMAT);
        List<MonthlyBudget> budgets = monthlyBudgetRepository.findByUserIdAndMonth(userId, m);

        return budgets.stream()
            .map(b -> toBudgetDto(userId, b))
            .toList();
    }

    /**
     * Kiểm tra ngưỡng ngân sách 80% và 100% khi phát sinh chi tiêu mới.
     */
    public void checkAndAlertBudget(UUID userId, String categoryCode) {
        String currentMonth = LocalDate.now().format(MONTH_FORMAT);

        // 1. Kiểm tra ngân sách cho hạng mục cụ thể
        if (categoryCode != null && !"ALL".equalsIgnoreCase(categoryCode)) {
            monthlyBudgetRepository.findByUserIdAndMonthAndCategoryCode(userId, currentMonth, categoryCode.toUpperCase(Locale.ROOT))
                .ifPresent(b -> evaluateBudgetAlert(userId, b));
        }

        // 2. Kiểm tra ngân sách tổng ALL
        monthlyBudgetRepository.findByUserIdAndMonthAndCategoryCode(userId, currentMonth, "ALL")
            .ifPresent(b -> evaluateBudgetAlert(userId, b));
    }

    private void evaluateBudgetAlert(UUID userId, MonthlyBudget budget) {
        BigDecimal spent = calculateMonthSpending(userId, budget.getMonth(), budget.getCategoryCode());
        BigDecimal limit = budget.getBudgetLimit();

        if (limit.compareTo(BigDecimal.ZERO) <= 0) return;

        double percentage = spent.multiply(BigDecimal.valueOf(100))
            .divide(limit, 1, RoundingMode.HALF_UP)
            .doubleValue();

        String catName = "ALL".equalsIgnoreCase(budget.getCategoryCode())
            ? "Tổng chi tiêu tháng"
            : resolveCategoryMeta(budget.getCategoryCode(), Collections.emptyMap()).name();

        if (percentage >= 100.0 && !budget.isAlertTriggered100()) {
            log.warn("VƯỢT NGÂN SÁCH [user={}]: Khoản chi vừa rồi khiến mục '{}' vượt giới hạn tháng ({}/{}đ - {}%)",
                userId, catName, spent.longValue(), limit.longValue(), percentage);
            budget.setAlertTriggered100(true);
            budget.setAlertTriggered80(true);
            monthlyBudgetRepository.save(budget);
        } else if (percentage >= 80.0 && !budget.isAlertTriggered80()) {
            log.warn("CẢNH BÁO NGÂN SÁCH [user={}]: Bạn đã chi tiêu {}% ({}/{}đ) ngân sách '{}' trong tháng này",
                userId, percentage, spent.longValue(), limit.longValue(), catName);
            budget.setAlertTriggered80(true);
            monthlyBudgetRepository.save(budget);
        }
    }

    private BigDecimal calculateMonthSpending(UUID userId, String month, String categoryCode) {
        Instant start = currentMonthStart();

        Wallet wallet = walletService.getOrCreateWallet(userId);
        List<Transaction> inWalletTxs = transactionRepository
            .findByWalletIdAndTypeInAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(wallet.getId(), SPEND_TYPES, start);

        Map<UUID, String> overrides = categoryOverrideRepository.findByUserId(userId).stream()
            .collect(Collectors.toMap(TransactionCategoryOverride::getTransactionId, TransactionCategoryOverride::getCategoryCode, (a, b) -> b));

        List<ExternalExpenseEntry> externalExpenses = externalExpenseEntryRepository
            .findByUserIdAndSpentAtGreaterThanEqualOrderBySpentAtDesc(userId, start);

        BigDecimal sum = BigDecimal.ZERO;

        boolean isAll = "ALL".equalsIgnoreCase(categoryCode);

        for (Transaction tx : inWalletTxs) {
            String cat = overrides.get(tx.getId());
            if (cat == null) {
                cat = spendingCategorizer.categorize(tx).getCode();
            }
            if (isAll || cat.equalsIgnoreCase(categoryCode)) {
                sum = sum.add(tx.getAmount());
            }
        }

        for (ExternalExpenseEntry ext : externalExpenses) {
            if (isAll || ext.getCategoryCode().equalsIgnoreCase(categoryCode)) {
                sum = sum.add(ext.getAmount());
            }
        }

        return sum;
    }

    private MonthlyBudgetDto toBudgetDto(UUID userId, MonthlyBudget budget) {
        BigDecimal spent = calculateMonthSpending(userId, budget.getMonth(), budget.getCategoryCode());
        BigDecimal limit = budget.getBudgetLimit();

        double percentage = 0.0;
        if (limit.compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.multiply(BigDecimal.valueOf(100))
                .divide(limit, 1, RoundingMode.HALF_UP)
                .doubleValue();
        }

        String status = "SAFE";
        if (percentage >= 100.0) {
            status = "EXCEEDED_100";
        } else if (percentage >= 80.0) {
            status = "WARNING_80";
        }

        String catName = "ALL".equalsIgnoreCase(budget.getCategoryCode())
            ? "Tổng ngân sách tháng"
            : resolveCategoryMeta(budget.getCategoryCode(), Collections.emptyMap()).name();

        return new MonthlyBudgetDto(
            budget.getId(),
            budget.getMonth(),
            budget.getCategoryCode(),
            catName,
            limit,
            spent,
            percentage,
            status
        );
    }

    private CategoryMeta resolveCategoryMeta(String code, Map<String, CustomSpendingCategory> customCategories) {
        if (code == null) {
            SpendingCategory other = SpendingCategory.OTHER;
            return new CategoryMeta(other.getCode(), other.getName(), other.getIcon(), other.getColor());
        }

        CustomSpendingCategory custom = customCategories.get(code.toUpperCase(Locale.ROOT));
        if (custom != null) {
            return new CategoryMeta(custom.getCode(), custom.getName(), custom.getIcon(), custom.getColor());
        }

        SpendingCategory std = SpendingCategory.fromCode(code);
        return new CategoryMeta(std.getCode(), std.getName(), std.getIcon(), std.getColor());
    }

    private record CategoryMeta(String code, String name, String icon, String color) {
    }

    private static Instant currentMonthStart() {
        return LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    }

    private static Instant currentWeekStart() {
        return LocalDate.now().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
            .atStartOfDay(ZoneId.systemDefault()).toInstant();
    }
}
