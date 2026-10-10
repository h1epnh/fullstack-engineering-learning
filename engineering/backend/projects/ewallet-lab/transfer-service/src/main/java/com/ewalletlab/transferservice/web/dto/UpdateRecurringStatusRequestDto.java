package com.ewalletlab.transferservice.web.dto;

import com.ewalletlab.transferservice.domain.RecurringTransferStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateRecurringStatusRequestDto(
    @NotNull(message = "Trạng thái không được để trống (ACTIVE, PAUSED, CANCELLED)")
    RecurringTransferStatus status
) {
}
