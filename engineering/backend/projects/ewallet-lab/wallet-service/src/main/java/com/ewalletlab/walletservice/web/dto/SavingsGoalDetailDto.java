package com.ewalletlab.walletservice.web.dto;

import java.util.List;

public record SavingsGoalDetailDto(
    SavingsGoalDto goal,
    List<SavingsGoalTransactionDto> transactions
) {}

