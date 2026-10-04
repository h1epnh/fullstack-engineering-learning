package com.ewalletlab.familywalletservice.service;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import com.ewalletlab.familywalletservice.repository.FamilyLinkRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Single-attempt, {@code @Transactional} upsert logic for {@link FamilyLink}, kept separate from
 * {@link FamilyWalletService} so {@link FamilyWalletService#addOrUpdateMember}'s retry loop can run
 * each attempt in a brand-new transaction (see that method's javadoc for the race being fixed —
 * concurrent inserts for a not-yet-linked member hitting the UNIQUE constraint on
 * {@code member_user_id}).
 */
@Component
class FamilyLinkMutationExecutor {

    private final FamilyLinkRepository repository;

    FamilyLinkMutationExecutor(FamilyLinkRepository repository) {
        this.repository = repository;
    }

    @Transactional
    FamilyLink upsertOnce(UUID parentUserId, UserServiceClient.UserResponse member, BigDecimal monthlyLimit) {
        Optional<FamilyLink> existing = repository.findByMemberUserId(member.id());
        if (existing.isPresent()) {
            FamilyLink link = existing.get();
            if (!link.getParentUserId().equals(parentUserId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Thành viên này đã thuộc về một Ví Gia Đình khác (mỗi thành viên chỉ thuộc 1 gia đình)");
            }
            link.updateLimit(monthlyLimit);
            return repository.save(link);
        }
        FamilyLink link = new FamilyLink(parentUserId, member.id(), member.phone(), member.name(), monthlyLimit);
        return repository.save(link);
    }
}
