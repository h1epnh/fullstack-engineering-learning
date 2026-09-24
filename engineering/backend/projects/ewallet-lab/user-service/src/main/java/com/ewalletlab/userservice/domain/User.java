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

    protected User() {
        // JPA
    }

    public User(String phone, String name) {
        this.phone = phone;
        this.name = name;
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
}
