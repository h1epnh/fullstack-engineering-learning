package com.ewalletlab.loyaltyservice.domain;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class VoucherPassCatalog {

    public static final List<PassPackageDefinition> PACKAGES = List.of(
        new PassPackageDefinition(
            "PASS_BILL_SAVER",
            "Gói Tiết Kiệm Hoá Đơn",
            "Tiết kiệm đến 25.000đ cho hoá đơn Điện, Nước và Internet hàng tháng.",
            new BigDecimal("15000"),
            30,
            List.of(
                new VoucherTemplate(
                    "Giảm 10.000đ hoá đơn Điện/Nước",
                    "Áp dụng cho hoá đơn Điện hoặc Nước từ 50.000đ",
                    new BigDecimal("10000"),
                    new BigDecimal("50000"),
                    "ELECTRICITY_WATER"
                ),
                new VoucherTemplate(
                    "Giảm 10.000đ hoá đơn Internet",
                    "Áp dụng cho hoá đơn Internet/Truyền hình từ 50.000đ",
                    new BigDecimal("10000"),
                    new BigDecimal("50000"),
                    "INTERNET"
                ),
                new VoucherTemplate(
                    "Giảm 5.000đ mọi hoá đơn",
                    "Áp dụng cho hoá đơn bất kỳ từ 20.000đ",
                    new BigDecimal("5000"),
                    new BigDecimal("20000"),
                    "ALL"
                )
            )
        ),
        new PassPackageDefinition(
            "PASS_STUDENT",
            "Gói Hội Viên Học Sinh - Sinh Viên",
            "Gói ưu đãi đặc quyền cho hoá đơn học tập, nạp cước và dịch vụ số.",
            new BigDecimal("10000"),
            30,
            List.of(
                new VoucherTemplate(
                    "Giảm 12.000đ hoá đơn Học phí/Dịch vụ số",
                    "Áp dụng cho hoá đơn học tập hoặc bất kỳ từ 30.000đ",
                    new BigDecimal("12000"),
                    new BigDecimal("30000"),
                    "ALL"
                ),
                new VoucherTemplate(
                    "Giảm 5.000đ mọi hoá đơn",
                    "Áp dụng cho hoá đơn bất kỳ từ 20.000đ",
                    new BigDecimal("5000"),
                    new BigDecimal("20000"),
                    "ALL"
                )
            )
        ),
        new PassPackageDefinition(
            "PASS_MEGA_COMBO",
            "Gói Siêu Tiết Kiệm Gia Đình",
            "Bộ 4 voucher giảm giá toàn diện tổng trị giá 40.000đ cho cả gia đình.",
            new BigDecimal("25000"),
            30,
            List.of(
                new VoucherTemplate(
                    "Giảm 15.000đ hoá đơn Điện",
                    "Áp dụng cho hoá đơn Điện từ 100.000đ",
                    new BigDecimal("15000"),
                    new BigDecimal("100000"),
                    "ELECTRICITY"
                ),
                new VoucherTemplate(
                    "Giảm 10.000đ hoá đơn Nước",
                    "Áp dụng cho hoá đơn Nước từ 50.000đ",
                    new BigDecimal("10000"),
                    new BigDecimal("50000"),
                    "WATER"
                ),
                new VoucherTemplate(
                    "Giảm 10.000đ hoá đơn Internet",
                    "Áp dụng cho hoá đơn Internet từ 50.000đ",
                    new BigDecimal("10000"),
                    new BigDecimal("50000"),
                    "INTERNET"
                ),
                new VoucherTemplate(
                    "Giảm 5.000đ mọi hoá đơn",
                    "Áp dụng cho hoá đơn bất kỳ từ 20.000đ",
                    new BigDecimal("5000"),
                    new BigDecimal("20000"),
                    "ALL"
                )
            )
        )
    );

    public static Optional<PassPackageDefinition> findByCode(String code) {
        return PACKAGES.stream().filter(p -> p.code().equalsIgnoreCase(code)).findFirst();
    }
}

