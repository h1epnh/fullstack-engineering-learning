package com.ewalletlab.transferservice.web.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Max (see issue #6): MoMo's verified real limit for wallet-to-wallet transfers is
 * 100.000.000đ/ngày — https://www.momo.vn/hoi-dap/han-muc-nap-rut-tien-moi-ngay-la-bao-nhieu.
 * Applied here as a per-transaction cap (adapted, not a true daily aggregate — see DESIGN.md).
 * Issue #92: Hỗ trợ thiệp chúc mừng & lời chúc may mắn (greetingCardTheme + greetingMessage).
 */
public record TransferRequestDto(
    @NotNull UUID fromUserId,
    @NotBlank String toPhone,
    @NotNull @DecimalMin("0.01") @DecimalMax("100000000") BigDecimal amount,
    /** Issue #15 (mô phỏng step-up QĐ 2345/QĐ-NHNN) — null/missing = "chưa xác nhận", giống
     * {@code false}. Client set true khi gọi lại sau khi người dùng đã qua bước xác thực bổ sung
     * (giả lập). */
    Boolean stepUpConfirmed,
    String greetingCardTheme,
    @Size(max = 150, message = "Lời nhắn thiệp không được vượt quá 150 ký tự")
    String greetingMessage,
    String idempotencyKey
) {
    public TransferRequestDto(UUID fromUserId, String toPhone, BigDecimal amount, Boolean stepUpConfirmed) {
        this(fromUserId, toPhone, amount, stepUpConfirmed, null, null, null);
    }

    public TransferRequestDto(UUID fromUserId, String toPhone, BigDecimal amount, Boolean stepUpConfirmed,
                              String greetingCardTheme, String greetingMessage) {
        this(fromUserId, toPhone, amount, stepUpConfirmed, greetingCardTheme, greetingMessage, null);
    }

    public boolean isStepUpConfirmed() {
        return Boolean.TRUE.equals(stepUpConfirmed);
    }
}

