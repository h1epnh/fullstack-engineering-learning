package com.ewalletlab.investmentfundservice.web.dto;

import java.util.List;

public record DisclaimerDto(
    String title,
    List<String> requiredPoints,
    String fullNotice
) {
    public static final List<String> MANDATORY_POINTS = List.of(
        "Đây là mô phỏng học tập.",
        "KHÔNG PHẢI lời khuyên đầu tư thật.",
        "KHÔNG CÓ quỹ/công ty quản lý quỹ thật nào đứng sau (Dragon Capital/IPAAM/SSIAM/VCBF chỉ là nguồn tham khảo mô hình hợp tác thật của MoMo, KHÔNG phải đối tác của lab).",
        "Giá trị \"NAV\" mô phỏng CÓ THỂ GIẢM — khác Túi Thần Tài (lãi luôn dương), người dùng có thể chịu lỗ số dư mô phỏng, phải nói rõ ràng, không úp mở."
    );

    public static DisclaimerDto standard() {
        return new DisclaimerDto(
            "Cảnh báo rủi ro đầu tư chứng chỉ quỹ (Mô phỏng)",
            MANDATORY_POINTS,
            String.join("\n", MANDATORY_POINTS)
        );
    }
}

