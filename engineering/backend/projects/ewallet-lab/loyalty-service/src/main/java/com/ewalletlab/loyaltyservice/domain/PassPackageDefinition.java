package com.ewalletlab.loyaltyservice.domain;

import java.math.BigDecimal;
import java.util.List;

public record PassPackageDefinition(
    String code,
    String name,
    String description,
    BigDecimal price,
    int validDays,
    List<VoucherTemplate> voucherTemplates
) {}

