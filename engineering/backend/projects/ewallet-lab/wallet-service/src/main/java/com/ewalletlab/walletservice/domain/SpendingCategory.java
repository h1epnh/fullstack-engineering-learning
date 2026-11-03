package com.ewalletlab.walletservice.domain;

public enum SpendingCategory {
    FOOD_DRINK("FOOD_DRINK", "Ăn uống", "restaurant", "#f97316"),
    SHOPPING("SHOPPING", "Mua sắm", "shopping_bag", "#8b5cf6"),
    BILLS("BILLS", "Hoá đơn & Tiện ích", "receipt_long", "#0284c7"),
    TRANSPORT("TRANSPORT", "Di chuyển", "directions_car", "#10b981"),
    ENTERTAINMENT("ENTERTAINMENT", "Giải trí & Dịch vụ", "sports_esports", "#ec4899"),
    HEALTH_EDU("HEALTH_EDU", "Y tế & Giáo dục", "local_hospital", "#ef4444"),
    INVESTMENT("INVESTMENT", "Đầu tư & Tích luỹ", "trending_up", "#f59e0b"),
    OTHER("OTHER", "Chi tiêu khác", "more_horiz", "#64748b");

    private final String code;
    private final String name;
    private final String icon;
    private final String color;

    SpendingCategory(String code, String name, String icon, String color) {
        this.code = code;
        this.name = name;
        this.icon = icon;
        this.color = color;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getIcon() {
        return icon;
    }

    public String getColor() {
        return color;
    }

    public static SpendingCategory fromCode(String code) {
        if (code == null) return OTHER;
        for (SpendingCategory c : values()) {
            if (c.code.equalsIgnoreCase(code.trim())) {
                return c;
            }
        }
        return OTHER;
    }
}
