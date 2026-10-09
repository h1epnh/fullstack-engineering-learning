package com.ewalletlab.loyaltyservice.web.dto;

import com.ewalletlab.loyaltyservice.domain.LoyaltyMission;
import com.ewalletlab.loyaltyservice.domain.MissionStatus;

/** Issue #38 — {@code GET /loyalty/missions}'s response, one per {@code
 * LoyaltyMissionCatalog.MISSIONS} entry. */
public record MissionDto(String code, String title, String description, int rewardPoints, MissionStatus status) {
    public static MissionDto of(LoyaltyMission mission, MissionStatus status) {
        return new MissionDto(mission.code(), mission.title(), mission.description(), mission.rewardPoints(), status);
    }
}
