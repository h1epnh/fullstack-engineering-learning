package com.ewalletlab.luckymoneyservice.repository;

import com.ewalletlab.luckymoneyservice.domain.GiftCardTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GiftCardTransferRepository extends JpaRepository<GiftCardTransfer, UUID> {
    List<GiftCardTransfer> findByRecipientUserIdOrderByCreatedAtDesc(UUID recipientUserId);
    List<GiftCardTransfer> findBySenderIdOrderByCreatedAtDesc(UUID senderId);
}
