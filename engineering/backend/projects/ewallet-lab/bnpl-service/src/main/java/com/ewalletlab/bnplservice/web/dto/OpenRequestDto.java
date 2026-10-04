package com.ewalletlab.bnplservice.web.dto;

/** {@code acceptedDisclaimer} must be true — the UI only sends it from the blocking disclaimer modal. */
public record OpenRequestDto(boolean acceptedDisclaimer) {
}
