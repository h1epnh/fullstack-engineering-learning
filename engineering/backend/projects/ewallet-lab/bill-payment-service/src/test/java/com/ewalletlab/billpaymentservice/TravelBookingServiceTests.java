package com.ewalletlab.billpaymentservice;

import com.ewalletlab.billpaymentservice.domain.BookingStatus;
import com.ewalletlab.billpaymentservice.domain.TravelBooking;
import com.ewalletlab.billpaymentservice.domain.TravelTrip;
import com.ewalletlab.billpaymentservice.domain.TripType;
import com.ewalletlab.billpaymentservice.repository.TravelBookingRepository;
import com.ewalletlab.billpaymentservice.repository.TravelTripRepository;
import com.ewalletlab.billpaymentservice.service.TravelBookingService;
import com.ewalletlab.billpaymentservice.service.WalletServiceClient;
import com.ewalletlab.billpaymentservice.web.dto.BookTicketRequestDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelBookingDto;
import com.ewalletlab.billpaymentservice.web.dto.TravelTripDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TravelBookingServiceTests {

    @Mock
    private TravelTripRepository travelTripRepository;

    @Mock
    private TravelBookingRepository travelBookingRepository;

    @Mock
    private WalletServiceClient walletServiceClient;

    private TravelBookingService service;

    @BeforeEach
    void setUp() {
        service = new TravelBookingService(travelTripRepository, travelBookingRepository, walletServiceClient);
    }

    @Test
    void searchTrips_returnsMatchingTrips() {
        TravelTrip trip = new TravelTrip(
            UUID.randomUUID(), TripType.BUS, "Phương Trang", "Hà Nội", "Sa Pa",
            Instant.now().plus(1, ChronoUnit.DAYS), Instant.now().plus(1, ChronoUnit.DAYS).plus(6, ChronoUnit.HOURS),
            new BigDecimal("280000"), 40, 40
        );
        when(travelTripRepository.findAllByOrderByDepartureTimeAsc()).thenReturn(List.of(trip));

        List<TravelTripDto> results = service.searchTrips(TripType.BUS, "Hà Nội", "Sa Pa", null);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).carrierName()).isEqualTo("Phương Trang");
        assertThat(results.get(0).origin()).isEqualTo("Hà Nội");
    }

    @Test
    void bookTicket_success_decrementsSeatsAndDebitsWallet() {
        UUID tripId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        TravelTrip trip = new TravelTrip(
            tripId, TripType.FLIGHT, "Vietnam Airlines", "Hà Nội", "TP. Hồ Chí Minh",
            Instant.now().plus(2, ChronoUnit.DAYS), Instant.now().plus(2, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS),
            new BigDecimal("1850000"), 180, 10
        );

        when(travelTripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(walletServiceClient.debit(eq(userId), eq(new BigDecimal("1850000")), anyString(), anyString(), eq(false)))
            .thenReturn(new WalletServiceClient.DebitResult(userId, new BigDecimal("5000000")));
        when(travelBookingRepository.save(any(TravelBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookTicketRequestDto req = new BookTicketRequestDto(userId, tripId, "Nguyen Van A", "0912345678", "12A");
        TravelBookingDto result = service.bookTicket(req);

        assertThat(result.passengerName()).isEqualTo("Nguyen Van A");
        assertThat(result.seatNumber()).isEqualTo("12A");
        assertThat(result.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(result.bookingCode()).startsWith("BK-");
        assertThat(result.ticketCode()).startsWith("TK-");
        assertThat(trip.getAvailableSeats()).isEqualTo(9);

        verify(walletServiceClient).debit(eq(userId), eq(new BigDecimal("1850000")), anyString(), anyString(), eq(false));
        verify(travelTripRepository).saveAndFlush(trip);
    }

    @Test
    void bookTicket_noAvailableSeats_throwsConflict() {
        UUID tripId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        TravelTrip trip = new TravelTrip(
            tripId, TripType.TRAIN, "Đường Sắt Việt Nam", "Hà Nội", "Đà Nẵng",
            Instant.now().plus(1, ChronoUnit.DAYS), Instant.now().plus(2, ChronoUnit.DAYS),
            new BigDecimal("650000"), 100, 0
        );

        when(travelTripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        BookTicketRequestDto req = new BookTicketRequestDto(userId, tripId, "Nguyen Van B", "0987654321", "01");

        assertThatThrownBy(() -> service.bookTicket(req))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Chuyến đi đã hết ghế trống");

        verifyNoInteractions(walletServiceClient);
    }

    @Test
    void cancelBooking_success_refunds85PercentAndRestoresSeat() {
        UUID tripId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();

        TravelTrip trip = new TravelTrip(
            tripId, TripType.BUS, "Thành Bưởi", "TP. Hồ Chí Minh", "Đà Lạt",
            Instant.now().plus(2, ChronoUnit.DAYS), Instant.now().plus(2, ChronoUnit.DAYS).plus(7, ChronoUnit.HOURS),
            new BigDecimal("300000"), 34, 10
        );

        TravelBooking booking = new TravelBooking(
            bookingId, userId, tripId, "Tran Van C", "0909090909", "B05",
            new BigDecimal("300000"), "BK-123456", "TK-654321", BookingStatus.CONFIRMED
        );

        when(travelBookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(travelTripRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(travelBookingRepository.save(any(TravelBooking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TravelBookingDto cancelled = service.cancelBooking(bookingId, userId);

        assertThat(cancelled.status()).isEqualTo(BookingStatus.CANCELLED_REFUNDED);
        assertThat(trip.getAvailableSeats()).isEqualTo(11);

        // 85% of 300,000 = 255,000
        BigDecimal expectedRefund = new BigDecimal("255000");
        verify(walletServiceClient).credit(eq(userId), eq(expectedRefund), eq("REFUND"), eq("BK-123456"), anyString());
        verify(travelTripRepository).save(trip);
    }

    @Test
    void cancelBooking_alreadyDeparted_throwsBadRequest() {
        UUID tripId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();

        TravelTrip trip = new TravelTrip(
            tripId, TripType.BUS, "Thành Bưởi", "TP. Hồ Chí Minh", "Đà Lạt",
            Instant.now().minus(2, ChronoUnit.HOURS), Instant.now().plus(5, ChronoUnit.HOURS),
            new BigDecimal("300000"), 34, 10
        );

        TravelBooking booking = new TravelBooking(
            bookingId, userId, tripId, "Tran Van C", "0909090909", "B05",
            new BigDecimal("300000"), "BK-123456", "TK-654321", BookingStatus.CONFIRMED
        );

        when(travelBookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(travelTripRepository.findById(tripId)).thenReturn(Optional.of(trip));

        assertThatThrownBy(() -> service.cancelBooking(bookingId, userId))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("Không thể huỷ vé cho chuyến đi đã khởi hành");

        verifyNoInteractions(walletServiceClient);
    }
}
