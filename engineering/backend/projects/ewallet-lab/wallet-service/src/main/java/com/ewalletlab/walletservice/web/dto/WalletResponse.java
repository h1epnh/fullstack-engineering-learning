package com.ewalletlab.walletservice.web.dto;

import com.ewalletlab.walletservice.domain.Wallet;

import java.math.BigDecimal;
import java.util.UUID;

public record WalletResponse(UUID userId, BigDecimal balance) {
    public static WalletResponse from(Wallet wallet) {
        return new WalletResponse(wallet.getUserId(), wallet.getBalance());
    }
}
