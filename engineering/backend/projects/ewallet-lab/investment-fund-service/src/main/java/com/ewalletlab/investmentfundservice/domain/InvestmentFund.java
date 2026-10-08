package com.ewalletlab.investmentfundservice.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "investment_funds")
public class InvestmentFund {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 512)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal nav;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal initialNav;

    @Column(nullable = false)
    private Instant updatedAt;

    @Version
    private Long version;

    protected InvestmentFund() {
    }

    public InvestmentFund(UUID id, String code, String name, String description, BigDecimal nav) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.nav = nav;
        this.initialNav = nav;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getNav() {
        return nav;
    }

    public void setNav(BigDecimal nav) {
        this.nav = nav;
        this.updatedAt = Instant.now();
    }

    public BigDecimal getInitialNav() {
        return initialNav;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Long getVersion() {
        return version;
    }
}

