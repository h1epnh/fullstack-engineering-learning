package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.Transaction;
import org.springframework.data.domain.Page;

import java.util.List;

/** Issue #36 — explicit DTO instead of returning Spring Data's {@code Page<Transaction>} directly:
 * avoids the Jackson warning about serializing {@code PageImpl} (leaks internal {@code Pageable}
 * details, Spring's own docs recommend against it) and keeps the response shape stable/predictable
 * for the frontend regardless of what Spring Data's {@code Page} implementation looks like. */
public record TransactionPageDto(List<Transaction> transactions, int page, int size, long totalElements,
                                  int totalPages) {
    public static TransactionPageDto from(Page<Transaction> page) {
        return new TransactionPageDto(page.getContent(), page.getNumber(), page.getSize(),
            page.getTotalElements(), page.getTotalPages());
    }
}
