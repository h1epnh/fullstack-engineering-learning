package com.ewalletlab.loyaltyservice.domain;

import java.math.BigDecimal;

public record VoucherTemplate(
    String title,
    String description,
    BigDecimal discountAmount,
    BigDecimal minOrderAmount,
    String applicableCategory
) {}

