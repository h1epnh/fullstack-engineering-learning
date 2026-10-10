package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.TravelTrip;
import com.ewalletlab.billpaymentservice.domain.TripType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TravelTripDto(
    UUID id,
    TripType tripType,
    String carrierName,
    String origin,
    String destination,
    Instant departureTime,
    Instant arrivalTime,
    BigDecimal price,
    int totalSeats,
    int availableSeats
) {
    public static TravelTripDto from(TravelTrip trip) {
        return new TravelTripDto(
            trip.getId(),
            trip.getTripType(),
            trip.getCarrierName(),
            trip.getOrigin(),
            trip.getDestination(),
            trip.getDepartureTime(),
            trip.getArrivalTime(),
            trip.getPrice(),
            trip.getTotalSeats(),
            trip.getAvailableSeats()
        );
    }
}
