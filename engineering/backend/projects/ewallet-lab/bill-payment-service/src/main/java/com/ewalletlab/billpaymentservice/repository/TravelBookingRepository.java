package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.TravelBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TravelBookingRepository extends JpaRepository<TravelBooking, UUID> {

    List<TravelBooking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<TravelBooking> findByBookingCode(String bookingCode);
}
