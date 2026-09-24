package com.ewalletlab.topupservice.repository;

import com.ewalletlab.topupservice.domain.LinkedBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LinkedBankAccountRepository extends JpaRepository<LinkedBankAccount, UUID> {
    List<LinkedBankAccount> findByUserId(UUID userId);
}
