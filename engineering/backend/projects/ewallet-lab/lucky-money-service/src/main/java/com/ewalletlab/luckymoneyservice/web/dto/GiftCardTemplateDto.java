package com.ewalletlab.luckymoneyservice.web.dto;

public record GiftCardTemplateDto(
    String templateCode,
    String title,
    String defaultMessage,
    String themeColor,
    String icon
) {}
