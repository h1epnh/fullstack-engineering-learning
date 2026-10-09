package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.Collection;
import java.util.UUID;

/** Issue #36 — predicate builders for {@code GET /wallets/{userId}/transactions/search}'s
 * independently-optional filters. Each returns {@code null} when its corresponding filter wasn't
 * provided; {@code Specification.where(...).and(...)} already treats a {@code null} component as
 * "no-op, don't add a predicate" (Spring Data's own contract for composing specs), so the caller
 * just chains all 4 without having to branch on which ones are actually present. */
final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    static Specification<Transaction> walletId(UUID walletId) {
        return (root, query, cb) -> cb.equal(root.get("walletId"), walletId);
    }

    static Specification<Transaction> type(TransactionType type) {
        if (type == null) {
            return null;
        }
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    static Specification<Transaction> typeIn(Collection<TransactionType> types) {
        if (types == null) {
            return null;
        }
        return (root, query, cb) -> root.get("type").in(types);
    }

    static Specification<Transaction> createdAtFrom(Instant fromInclusive) {
        if (fromInclusive == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), fromInclusive);
    }

    static Specification<Transaction> createdAtTo(Instant toExclusive) {
        if (toExclusive == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThan(root.get("createdAt"), toExclusive);
    }
}
