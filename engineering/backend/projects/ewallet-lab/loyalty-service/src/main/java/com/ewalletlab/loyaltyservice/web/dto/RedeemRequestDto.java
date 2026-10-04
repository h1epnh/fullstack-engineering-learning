package com.ewalletlab.loyaltyservice.web.dto;

import jakarta.validation.constraints.Min;

/** Lower bound (min-redeem-points) is enforced in the service so it follows configuration. */
public record RedeemRequestDto(@Min(1) long points) {
}
