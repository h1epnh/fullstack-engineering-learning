package com.ewalletlab.userservice.domain;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_phone", columnNames = "phone"))
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_tier")
    private KycTier kycTier = KycTier.UNVERIFIED;

    @Column(name = "id_card_number")
    private String idCardNumber;

    protected User() {
        // JPA
    }

    public User(String phone, String name) {
        this.phone = phone;
        this.name = name;
        this.kycTier = KycTier.UNVERIFIED;
    }

    @PostLoad
    void onPostLoad() {
        if (this.kycTier == null) {
            this.kycTier = KycTier.VERIFIED;
        }
    }

    public void verifyKyc(String idCardNumber) {
        this.kycTier = KycTier.VERIFIED;
        this.idCardNumber = idCardNumber;
    }

    public UUID getId() {
        return id;
    }

    public String getPhone() {
        return phone;
    }

    public String getName() {
        return name;
    }

    public KycTier getKycTier() {
        return kycTier != null ? kycTier : KycTier.VERIFIED;
    }

    public String getIdCardNumber() {
        return idCardNumber;
    }
}
