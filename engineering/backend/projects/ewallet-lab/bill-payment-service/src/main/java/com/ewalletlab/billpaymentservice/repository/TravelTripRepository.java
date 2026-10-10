package com.ewalletlab.billpaymentservice.repository;

import com.ewalletlab.billpaymentservice.domain.TravelTrip;
import com.ewalletlab.billpaymentservice.domain.TripType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TravelTripRepository extends JpaRepository<TravelTrip, UUID> {

    @Query("SELECT t FROM TravelTrip t WHERE " +
           "(:tripType IS NULL OR t.tripType = :tripType) AND " +
           "(:origin IS NULL OR LOWER(t.origin) LIKE LOWER(CONCAT('%', :origin, '%'))) AND " +
           "(:destination IS NULL OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) AND " +
           "(:startTime IS NULL OR t.departureTime >= :startTime) AND " +
           "(:endTime IS NULL OR t.departureTime <= :endTime) " +
           "ORDER BY t.departureTime ASC")
    List<TravelTrip> searchTrips(@Param("tripType") TripType tripType,
                                 @Param("origin") String origin,
                                 @Param("destination") String destination,
                                 @Param("startTime") Instant startTime,
                                 @Param("endTime") Instant endTime);

    List<TravelTrip> findAllByOrderByDepartureTimeAsc();
}
