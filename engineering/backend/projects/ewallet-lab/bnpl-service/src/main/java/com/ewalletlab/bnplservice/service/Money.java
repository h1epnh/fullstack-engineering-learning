package com.ewalletlab.bnplservice.service;

import java.math.BigDecimal;

final class Money {
    private Money() {
    }

    static String vnd(BigDecimal amount) {
        return "%,.0fđ".formatted(amount).replace(',', '.');
    }
}
