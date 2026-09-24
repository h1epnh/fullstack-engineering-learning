package com.ewalletlab.billpaymentservice.domain;

/**
 * Deliberately generic household-bill categories, not a real biller brand (no "EVN"/"VNPT"/etc.)
 * — see DESIGN.md's "Luồng bill payment" section: there is no public MoMo spec for bill
 * aggregation to bind field names to, so this whole service is a plainly-labelled mock.
 */
public enum BillCategory {
    ELECTRICITY,
    WATER,
    INTERNET,
    TV_CABLE
}
