package com.ewalletlab.investmentfundservice.web.dto;

import java.util.List;

public record FundDetailDto(
    FundDto fund,
    List<NavHistoryDto> history
) {
}

