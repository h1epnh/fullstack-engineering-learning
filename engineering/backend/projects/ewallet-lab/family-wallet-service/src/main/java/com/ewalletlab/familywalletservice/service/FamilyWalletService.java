package com.ewalletlab.familywalletservice.service;

import com.ewalletlab.familywalletservice.domain.FamilyLink;
import com.ewalletlab.familywalletservice.repository.FamilyLinkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Issue #12 — "Ví Gia Đình" (VNPay-inspired, NOT MoMo — see backend DESIGN.md). This service owns
 * exactly one thing: the parent-set {@code monthlyLimit} overlay on an existing member wallet. It
 * never moves money — enforcement runs inside wallet-service's own debit path (see wallet-service's
 * {@code WalletMutationExecutor}, which calls this service's read-only
 * {@code GET /family-wallets/members/{memberUserId}/limit}).
 */
@Service
public class FamilyWalletService {

    private static final Logger log = LoggerFactory.getLogger(FamilyWalletService.class);

    /** Retry budget for the create-side race on {@code member_user_id}'s UNIQUE constraint — same
     * pattern/reasoning as wallet-service's SavingsPocketService fix for issue #13's "open" race
     * (see backend DESIGN.md's "Túi Thần Tài" section, "bug fix" subsection): a plain
     * check-then-act (findByMemberUserId().isEmpty() then insert) is only safe from a raw 500 if
     * the constraint violation on the losing concurrent request is caught and retried/translated,
     * not left to bubble up as DataIntegrityViolationException. */
    private static final int MAX_UPSERT_ATTEMPTS = 3;

    /** Same 3 outbound types issue #7's monthly legal limit already tracks — a parent-set spending
     * cap is conceptually the same "outbound spend this month" measurement, just a second,
     * independently-configured ceiling on top of the legal one. */
    private static final Set<String> OUTBOUND_TYPES = Set.of("TRANSFER_OUT", "BILL_PAYMENT", "WITHDRAW");

    private final FamilyLinkRepository repository;
    private final UserServiceClient userServiceClient;
    private final WalletServiceClient walletServiceClient;
    private final FamilyLinkMutationExecutor mutationExecutor;

    public FamilyWalletService(FamilyLinkRepository repository, UserServiceClient userServiceClient,
                                WalletServiceClient walletServiceClient, FamilyLinkMutationExecutor mutationExecutor) {
        this.repository = repository;
        this.userServiceClient = userServiceClient;
        this.walletServiceClient = walletServiceClient;
        this.mutationExecutor = mutationExecutor;
    }

    public record MemberView(FamilyLink link, BigDecimal spentThisMonth) {
    }

    /**
     * Adds a new member, or updates the limit of an existing one if the same parent already
     * linked this member (upsert — avoids needing a separate PUT/PATCH endpoint on the frontend
     * just to change a limit).
     *
     * <p>The actual DB check-then-act (read then insert-or-update) runs in
     * {@link FamilyLinkMutationExecutor#upsertOnce}, a separate {@code @Transactional} bean for the
     * same reason {@code WalletMutationExecutor} is separate from {@code WalletService} (issue #5):
     * each retry attempt needs a brand-new transaction, which only works through a proxy boundary.
     * Two concurrent "add this same new member" requests (e.g. a parent double-tapping "Lưu", or —
     * theoretically — two different parents racing to link the same not-yet-linked member) can both
     * pass {@code findByMemberUserId(...).isEmpty()} before either INSERT commits; Postgres's UNIQUE
     * constraint on {@code member_user_id} then rejects the loser's insert as
     * {@code DataIntegrityViolationException} at flush/commit time. Retrying re-reads
     * {@code findByMemberUserId} from scratch inside a fresh transaction, which now sees the
     * winner's committed row and correctly falls into the "already exists" branch (update-if-same-
     * parent, or 409 if a different parent) instead of surfacing a raw 500.
     */
    public FamilyLink addOrUpdateMember(UUID parentUserId, String memberPhone, BigDecimal monthlyLimit) {
        UserServiceClient.UserResponse member;
        try {
            member = userServiceClient.findByPhone(memberPhone);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Không tìm thấy tài khoản Ewallet Lab với số điện thoại này");
        }
        if (member.id().equals(parentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Không thể đặt hạn mức cho chính mình");
        }
        for (int attempt = 1; attempt <= MAX_UPSERT_ATTEMPTS; attempt++) {
            try {
                return mutationExecutor.upsertOnce(parentUserId, member, monthlyLimit);
            } catch (DataIntegrityViolationException e) {
                if (attempt == MAX_UPSERT_ATTEMPTS) {
                    log.warn("family-wallet addOrUpdateMember for member={} lost the create race {} times, giving up — 409",
                        member.id(), MAX_UPSERT_ATTEMPTS);
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Xung đột khi thêm thành viên Ví Gia Đình (trùng thời điểm), vui lòng thử lại");
                }
                log.debug("family-wallet addOrUpdateMember for member={} lost the create race, retrying ({}/{})",
                    member.id(), attempt, MAX_UPSERT_ATTEMPTS);
            }
        }
        throw new IllegalStateException("unreachable");
    }

    public List<MemberView> listMembers(UUID parentUserId) {
        return repository.findByParentUserIdOrderByCreatedAtDesc(parentUserId).stream()
            .map(this::toView)
            .toList();
    }

    public MemberView toView(FamilyLink link) {
        return new MemberView(link, spentThisMonth(link.getMemberUserId()));
    }

    /** Called by wallet-service — 404 (via empty Optional at the controller) means "not a linked
     * family member", the common case for the vast majority of debits, not an error. */
    public Optional<FamilyLink> limitFor(UUID memberUserId) {
        return repository.findByMemberUserId(memberUserId);
    }

    /** Parent's "xem lịch sử chi tiêu" view (issue #12's Task) — 403 if the caller isn't actually
     * this member's parent, so one parent can't read another family's member history by guessing a
     * memberUserId. */
    public List<WalletServiceClient.TransactionView> memberHistory(UUID parentUserId, UUID memberUserId) {
        FamilyLink link = repository.findByMemberUserId(memberUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thành viên này chưa thuộc Ví Gia Đình nào"));
        if (!link.getParentUserId().equals(parentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải quản trị viên của thành viên này");
        }
        return walletServiceClient.getTransactions(memberUserId).stream()
            .filter(tx -> OUTBOUND_TYPES.contains(tx.type()))
            .toList();
    }

    private BigDecimal spentThisMonth(UUID memberUserId) {
        Instant monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        return walletServiceClient.getTransactions(memberUserId).stream()
            .filter(tx -> OUTBOUND_TYPES.contains(tx.type()) && !tx.createdAt().isBefore(monthStart))
            .map(WalletServiceClient.TransactionView::amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
