package com.ewalletlab.userservice.repository;

import com.ewalletlab.userservice.domain.WebauthnCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WebauthnCredentialRepository extends JpaRepository<WebauthnCredential, UUID> {
    Optional<WebauthnCredential> findByCredentialId(String credentialId);

    long countByUserId(UUID userId);
}
