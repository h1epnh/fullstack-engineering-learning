package com.ewalletlab.paymentrequestservice.web.dto;

import com.ewalletlab.paymentrequestservice.domain.PaymentRequest;
import com.ewalletlab.paymentrequestservice.domain.PaymentRequestStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Issue #11 — "Danh sách đã thu": the whole split-bill group's shares plus a computed
 * collected/remaining summary. {@code shares} is every {@link PaymentRequest} row with this
 * {@code groupId} converted via {@link PaymentRequestDto#from} (so each share's own {@code id} can
 * be used as a normal LINK token — the payer for one share opens {@code /links/{id}/pay} directly,
 * no separate "pay a split share" endpoint exists).
 */
public record SplitGroupDto(
    UUID groupId,
    String groupLabel,
    BigDecimal groupTotal,
    BigDecimal totalCollected,
    BigDecimal totalRemaining,
    List<PaymentRequestDto> shares
) {
    public static SplitGroupDto from(List<PaymentRequest> group) {
        BigDecimal groupTotal = group.get(0).getGroupTotal();
        String groupLabel = group.get(0).getGroupLabel();
        BigDecimal collected = group.stream()
            .filter(r -> r.getStatus() == PaymentRequestStatus.PAID)
            .map(PaymentRequest::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new SplitGroupDto(
            group.get(0).getGroupId(), groupLabel, groupTotal, collected, groupTotal.subtract(collected),
            group.stream().map(PaymentRequestDto::from).toList());
    }
}
