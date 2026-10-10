package com.ewalletlab.billpaymentservice.web;

import com.ewalletlab.billpaymentservice.domain.TripType;
import com.ewalletlab.billpaymentservice.service.TravelBookingService;
import com.ewalletlab.billpaymentservice.web.dto.BookTicketRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelBookingDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelTripDto;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/travel")
public class TravelBookingController {

    private final TravelBookingService travelBookingService;

    public TravelBookingController(TravelBookingService travelBookingService) {
        this.travelBookingService = travelBookingService;
    }

    @GetMapping("/trips/search")
    public List<TravelTripDto> searchTrips(
        @RequestParam(required = false) TripType type,
        @RequestParam(required = false) String origin,
        @RequestParam(required = false) String destination,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return travelBookingService.searchTrips(type, origin, destination, date);
    }

    @GetMapping("/trips/{id}")
    public TravelTripDto getTrip(@PathVariable UUID id) {
        return travelBookingService.getTrip(id);
    }

    @PostMapping("/bookings")
    public ResponseEntity<TravelBookingDto> bookTicket(@Valid @RequestBody BookTicketRequestDto request) {
        TravelBookingDto booking = travelBookingService.bookTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/bookings")
    public List<TravelBookingDto> getBookings(@RequestParam UUID userId) {
        return travelBookingService.getBookings(userId);
    }

    @PostMapping("/bookings/{id}/cancel")
    public TravelBookingDto cancelBooking(
        @PathVariable UUID id,
        @RequestParam(required = false) UUID userId,
        @RequestBody(required = false) Map<String, String> body
    ) {
        UUID effectiveUserId = userId;
        if (effectiveUserId == null && body != null && body.containsKey("userId")) {
            effectiveUserId = UUID.fromString(body.get("userId"));
        }
        if (effectiveUserId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Thiếu userId để huỷ vé"
            );
        }
        return travelBookingService.cancelBooking(id, effectiveUserId);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<String> handleOptimisticLock(ObjectOptimisticLockingFailureException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body("Ghế ngồi vừa được người khác đặt trước, vui lòng thử lại hoặc chọn chuyến khác");
    }
}
