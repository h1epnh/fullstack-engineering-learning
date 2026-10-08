package com.ewalletlab.walletservice.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "savings_goals")
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal targetAmount;

    @Column(nullable = false, precision = 38, scale = 2)
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SavingsGoalStatus status = SavingsGoalStatus.ACTIVE;

    @Version
    private Long version;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected SavingsGoal() {}

    public SavingsGoal(UUID userId, String name, BigDecimal targetAmount, LocalDate targetDate) {
        // id/version để Hibernate tự quản lý (@GeneratedValue + @Version) — tự gán id tay ở đây
        // trước đó khiến Hibernate coi entity là "detached" khi persist (PropertyValueException:
        // uninitialized version value), xem Fund.java/BillPayment.java cho pattern đúng đã dùng
        // nhất quán trong dự án.
        this.userId = userId;
        this.name = name;
        this.targetAmount = targetAmount;
        this.currentAmount = BigDecimal.ZERO;
        this.targetDate = targetDate;
        this.status = SavingsGoalStatus.ACTIVE;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getTargetAmount() {
        return targetAmount;
    }

    public BigDecimal getCurrentAmount() {
        return currentAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public SavingsGoalStatus getStatus() {
        return status;
    }

    public Long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void deposit(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền nạp phải lớn hơn 0");
        }
        this.currentAmount = this.currentAmount.add(amount);
        if (this.currentAmount.compareTo(this.targetAmount) >= 0) {
            this.status = SavingsGoalStatus.COMPLETED;
        }
        this.updatedAt = Instant.now();
    }

    public void withdraw(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Số tiền rút phải lớn hơn 0");
        }
        if (this.currentAmount.compareTo(amount) < 0) {
            throw new IllegalStateException("Số dư mục tiêu không đủ để rút");
        }
        this.currentAmount = this.currentAmount.subtract(amount);
        this.updatedAt = Instant.now();
    }

    public void setStatus(SavingsGoalStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }
}
