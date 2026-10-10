package com.ewalletlab.billpaymentservice.web.dto;

import com.ewalletlab.billpaymentservice.domain.BookingStatus;
import com.ewalletlab.billpaymentservice.domain.TravelBooking;
import com.ewalletlab.billpaymentservice.domain.TravelTrip;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TravelBookingDto(
    UUID id,
    UUID userId,
    UUID tripId,
    String passengerName,
    String passengerPhone,
    String seatNumber,
    BigDecimal totalAmount,
    String bookingCode,
    String ticketCode,
    BookingStatus status,
    Instant createdAt,
    Instant updatedAt,
    TravelTripDto trip
) {
    public static TravelBookingDto from(TravelBooking booking, TravelTrip trip) {
        return new TravelBookingDto(
            booking.getId(),
            booking.getUserId(),
            booking.getTripId(),
            booking.getPassengerName(),
            booking.getPassengerPhone(),
            booking.getSeatNumber(),
            booking.getTotalAmount(),
            booking.getBookingCode(),
            booking.getTicketCode(),
            booking.getStatus(),
            booking.getCreatedAt(),
            booking.getUpdatedAt(),
            trip != null ? TravelTripDto.from(trip) : null
        );
    }
}
