package com.ewalletlab.walletservice.service;

import com.ewalletlab.walletservice.domain.SpendingCategory;
import com.ewalletlab.walletservice.domain.Transaction;
import com.ewalletlab.walletservice.domain.TransactionType;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class SpendingCategorizer {

    private static final String[] FOOD_KEYWORDS = {
        "cơm", "com", "phở", "pho", "bún", "bun", "trà sữa", "tra sua", "cafe", "cà phê", "ca phe", "coffee",
        "ăn", "an", "nhậu", "nhau", "bbq", "pizza", "lẩu", "lau", "bánh", "banh", "đồ ăn", "do an", "uống", "uong",
        "quán", "quan", "bếp", "bep", "mì", "mi", "kfc", "lotteria", "highlands", "starbucks", "phúc long", "tiệm ăn"
    };

    private static final String[] TRANSPORT_KEYWORDS = {
        "xăng", "xang", "grab", "taxi", "be", "vé xe", "ve xe", "epass", "vetc", "phạt nguội", "phat nguoi",
        "gửi xe", "gui xe", "xe buýt", "xe buyt", "bus", "vé tàu", "ve tau", "vé máy bay", "ve may bay",
        "vietjet", "vietnam airlines", "bamboo", "xanh sm"
    };

    private static final String[] SHOPPING_KEYWORDS = {
        "mua", "shop", "áo", "ao", "quần", "quan", "giày", "giay", "shopee", "tiki", "lazada",
        "siêu thị", "sieu thi", "store", "order", "thời trang", "thoi trang", "mỹ phẩm", "my pham", "đồ dùng", "do dung"
    };

    private static final String[] ENTERTAINMENT_KEYWORDS = {
        "phim", "cinema", "cgv", "lotte", "game", "netflix", "spotify", "youtube", "vé xem", "ve xem",
        "karaoke", "du lịch", "du lich", "tour", "resort", "khách sạn", "hotel"
    };

    private static final String[] HEALTH_EDU_KEYWORDS = {
        "thuốc", "thuoc", "bệnh viện", "benh vien", "khám", "kham", "bác sĩ", "bac si", "học phí", "hoc phi",
        "khoá học", "khoa hoc", "sách", "sach", "nha khoa", "tiêm", "tiem", "xét nghiệm", "phòng khám", "phong kham"
    };

    private static final String[] INVESTMENT_KEYWORDS = {
        "tích luỹ", "tich luy", "đầu tư", "dau tu", "tiết kiệm", "tiet kiem", "chứng khoán", "chung khoan",
        "vàng", "vang", "cổ phiếu", "co phieu", "quỹ", "quy"
    };

    private static final String[] BILLS_KEYWORDS = {
        "điện", "dien", "nước", "nuoc", "internet", "cáp", "cap", "hoá đơn", "hoa don", "tiện ích", "tien ich",
        "chung cư", "phí quản lý"
    };

    public SpendingCategory categorize(Transaction tx) {
        if (tx == null) return SpendingCategory.OTHER;

        String note = (tx.getNote() != null ? tx.getNote() : "").toLowerCase(Locale.ROOT);

        if (tx.getType() == TransactionType.BILL_PAYMENT) {
            if (containsAny(note, "netflix", "spotify", "vieon", "youtube", "game", "ch play", "apple")) {
                return SpendingCategory.ENTERTAINMENT;
            }
            if (containsAny(note, "bảo hiểm", "bao hiem")) {
                return SpendingCategory.HEALTH_EDU;
            }
            return SpendingCategory.BILLS;
        }

        return categorizeByNote(note);
    }

    public SpendingCategory categorizeByNote(String rawNote) {
        if (rawNote == null || rawNote.isBlank()) {
            return SpendingCategory.OTHER;
        }

        String note = rawNote.toLowerCase(Locale.ROOT);

        // Thứ tự ưu tiên: danh mục chuyên biệt trước danh mục chung chung (như shopping/mua)
        if (containsAny(note, HEALTH_EDU_KEYWORDS)) return SpendingCategory.HEALTH_EDU;
        if (containsAny(note, ENTERTAINMENT_KEYWORDS)) return SpendingCategory.ENTERTAINMENT;
        if (containsAny(note, FOOD_KEYWORDS)) return SpendingCategory.FOOD_DRINK;
        if (containsAny(note, TRANSPORT_KEYWORDS)) return SpendingCategory.TRANSPORT;
        if (containsAny(note, BILLS_KEYWORDS)) return SpendingCategory.BILLS;
        if (containsAny(note, INVESTMENT_KEYWORDS)) return SpendingCategory.INVESTMENT;
        if (containsAny(note, SHOPPING_KEYWORDS)) return SpendingCategory.SHOPPING;

        return SpendingCategory.OTHER;
    }

    private boolean containsAny(String text, String... keywords) {
        String[] words = text.split("[\\s,;:.!?_\\-]+");
        for (String kw : keywords) {
            if (kw.contains(" ")) {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("(?:^|[\\s,;:.!?_\\-])" + java.util.regex.Pattern.quote(kw) + "(?:$|[\\s,;:.!?_\\-])");
                if (p.matcher(text).find()) {
                    return true;
                }
            } else if (kw.length() <= 3) {
                for (String word : words) {
                    if (word.equals(kw)) {
                        return true;
                    }
                }
            } else {
                for (String word : words) {
                    if (word.equals(kw) || word.startsWith(kw)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
