package com.ewalletlab.loyaltyservice.domain;

import java.util.List;
import java.util.Optional;

/**
 * Issue #38 — fixed catalog of daily missions, same shape as {@code VoucherPassCatalog} (issue
 * #28): a plain in-memory list, NOT a DB-backed entity, even though the ticket's Task #1 literally
 * says "Entity LoyaltyMission" — deviated deliberately, documented in DESIGN.md, because this
 * service already has an established convention for exactly this kind of thing (a small, fixed,
 * code-defined catalog with no admin UI to mutate it) and introducing a second, inconsistent
 * pattern for the same shape of data in the same service would be worse than following the one
 * already here. {@code UserMissionProgress} (the actually-mutable, per-user, per-day state) IS a
 * real entity/table, same as {@code VoucherPassPurchase} is for issue #28's catalog.
 *
 * <p>Reward point numbers are exactly the ticket's own Task #2 — already-sourced by agent-ba/
 * agent-designer's market survey (MoMo/Shopee Xu/ZaloPay/GrabRewards), not independently
 * re-verified by agent-dev (no new external numbers invented here).
 */
public class LoyaltyMissionCatalog {

    public static final List<LoyaltyMission> MISSIONS = List.of(
        new LoyaltyMission("DAILY_TRANSFER", "Chuyển tiền trong ngày",
            "Thực hiện 1 giao dịch chuyển tiền bất kỳ hôm nay", 20, "TRANSFER_OUT", true),
        new LoyaltyMission("DAILY_BILL", "Thanh toán hoá đơn hoặc dịch vụ số",
            "Thanh toán 1 hoá đơn hoặc dịch vụ số hôm nay", 50, "BILL_PAYMENT", true),
        new LoyaltyMission("DAILY_SAVINGS", "Gửi tiết kiệm mục tiêu",
            "Nạp tiền vào Mục tiêu tiết kiệm hôm nay", 30, "SAVINGS_GOAL_DEPOSIT", true)
    );

    public static Optional<LoyaltyMission> findByCode(String code) {
        return MISSIONS.stream().filter(m -> m.code().equalsIgnoreCase(code)).findFirst();
    }
}
