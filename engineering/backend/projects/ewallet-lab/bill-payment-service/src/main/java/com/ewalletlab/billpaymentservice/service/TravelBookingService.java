package com.ewalletlab.billpaymentservice.service;

import com.ewalletlab.billpaymentservice.domain.BookingStatus;
import com.ewalletlab.billpaymentservice.domain.TravelBooking;
import com.ewalletlab.billpaymentservice.domain.TravelTrip;
import com.ewalletlab.billpaymentservice.domain.TripType;
import com.ewalletlab.billpaymentservice.repository.TravelBookingRepository;
import com.ewalletlab.billpaymentservice.repository.TravelTripRepository;
import com.ewalletlab.billpaymentservice.web.dto.BookTicketRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelBookingDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelTripDto;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class TravelBookingService {

    private final TravelTripRepository travelTripRepository;
    private final TravelBookingRepository travelBookingRepository;
    private final WalletServiceClient walletServiceClient;
    private final SecureRandom random = new SecureRandom();

    public TravelBookingService(TravelTripRepository travelTripRepository,
                                TravelBookingRepository travelBookingRepository,
                                WalletServiceClient walletServiceClient) {
        this.travelTripRepository = travelTripRepository;
        this.travelBookingRepository = travelBookingRepository;
        this.walletServiceClient = walletServiceClient;
    }

    public List<TravelTripDto> searchTrips(TripType tripType, String origin, String destination, LocalDate date) {
        List<TravelTrip> trips = travelTripRepository.findAllByOrderByDepartureTimeAsc();

        String normOrigin = (origin != null && !origin.isBlank()) ? origin.trim().toLowerCase() : null;
        String normDest = (destination != null && !destination.isBlank()) ? destination.trim().toLowerCase() : null;

        return trips.stream()
            .filter(t -> tripType == null || t.getTripType() == tripType)
            .filter(t -> normOrigin == null || t.getOrigin().toLowerCase().contains(normOrigin))
            .filter(t -> normDest == null || t.getDestination().toLowerCase().contains(normDest))
            .filter(t -> {
                if (date == null) return true;
                LocalDate tripDate = t.getDepartureTime().atZone(ZoneOffset.UTC).toLocalDate();
                return tripDate.equals(date);
            })
            .map(TravelTripDto::from)
            .toList();
    }

    public TravelTripDto getTrip(UUID id) {
        TravelTrip trip = travelTripRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi"));
        return TravelTripDto.from(trip);
    }

    @Transactional
    public TravelBookingDto bookTicket(BookTicketRequestDto request) {
        TravelTrip trip = travelTripRepository.findById(request.tripId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy chuyến đi"));

        if (trip.getAvailableSeats() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chuyến đi đã hết ghế trống");
        }

        // Deduct available seat (Optimistic locking guarded by @Version on TravelTrip)
        trip.setAvailableSeats(trip.getAvailableSeats() - 1);
        travelTripRepository.saveAndFlush(trip);

        String bookingCode = "BK-" + (100000 + random.nextInt(900000));
        String ticketCode = "TK-" + (100000 + random.nextInt(900000));
        String seatNumber = (request.seatNumber() != null && !request.seatNumber().isBlank())
            ? request.seatNumber().trim()
            : "GHE-" + (trip.getTotalSeats() - trip.getAvailableSeats());

        // Debit user wallet via walletServiceClient
        try {
            walletServiceClient.debit(
                request.userId(),
                trip.getPrice(),
                bookingCode,
                "Mua vé " + trip.getCarrierName() + " (" + trip.getOrigin() + " - " + trip.getDestination() + ")",
                false
            );
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 409) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Số dư ví không đủ để thanh toán vé");
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi trừ tiền ví: " + e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không thể kết nối wallet-service: " + e.getMessage());
        }

        TravelBooking booking = new TravelBooking(
            UUID.randomUUID(),
            request.userId(),
            trip.getId(),
            request.passengerName().trim(),
            request.passengerPhone().trim(),
            seatNumber,
            trip.getPrice(),
            bookingCode,
            ticketCode,
            BookingStatus.CONFIRMED
        );

        TravelBooking savedBooking = travelBookingRepository.save(booking);
        return TravelBookingDto.from(savedBooking, trip);
    }

    @Transactional
    public TravelBookingDto cancelBooking(UUID bookingId, UUID userId) {
        TravelBooking booking = travelBookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy vé đặt"));

        if (!booking.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên vé này");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vé đã ở trạng thái huỷ hoặc không thể huỷ");
        }

        TravelTrip trip = travelTripRepository.findById(booking.getTripId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin chuyến đi"));

        if (!trip.getDepartureTime().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể huỷ vé cho chuyến đi đã khởi hành");
        }

        // Refund 85% of total ticket amount (15% cancellation fee)
        BigDecimal refundAmount = booking.getTotalAmount()
            .multiply(new BigDecimal("0.85"))
            .setScale(0, RoundingMode.HALF_UP);

        try {
            walletServiceClient.credit(
                userId,
                refundAmount,
                "REFUND",
                booking.getBookingCode(),
                "Hoàn tiền 85% huỷ vé " + booking.getBookingCode()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Lỗi khi hoàn tiền ví: " + e.getMessage());
        }

        // Return 1 seat back to trip inventory
        trip.setAvailableSeats(trip.getAvailableSeats() + 1);
        travelTripRepository.save(trip);

        booking.setStatus(BookingStatus.CANCELLED_REFUNDED);
        TravelBooking updated = travelBookingRepository.save(booking);

        return TravelBookingDto.from(updated, trip);
    }

    public List<TravelBookingDto> getBookings(UUID userId) {
        List<TravelBooking> bookings = travelBookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookings.stream().map(b -> {
            TravelTrip trip = travelTripRepository.findById(b.getTripId()).orElse(null);
            return TravelBookingDto.from(b, trip);
        }).toList();
    }
}
