package com.ewalletlab.familywalletservice.repository;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FamilyLinkRepository extends JpaRepository<FamilyLink, UUID> {
    Optional<FamilyLink> findByMemberUserId(UUID memberUserId);

    List<FamilyLink> findByParentUserIdOrderByCreatedAtDesc(UUID parentUserId);
}
