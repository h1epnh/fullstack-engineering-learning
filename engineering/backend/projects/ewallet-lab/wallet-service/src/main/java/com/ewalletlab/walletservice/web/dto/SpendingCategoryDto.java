package com.ewalletlab.walletservice.web.dto;

public record SpendingCategoryDto(
    String code,
    String name,
    String icon,
    String color,
    boolean isCustom
) {
}
