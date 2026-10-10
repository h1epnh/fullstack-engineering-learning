package com.ewalletlab.billpaymentservice.config;

import com.ewalletlab.billpaymentservice.domain.TravelTrip;
import com.ewalletlab.billpaymentservice.domain.TripType;
import com.ewalletlab.billpaymentservice.repository.TravelTripRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
public class TravelTripDataInitializer implements CommandLineRunner {

    private final TravelTripRepository repository;

    public TravelTripDataInitializer(TravelTripRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        Instant now = Instant.now();
        Instant tomorrow = now.plus(1, ChronoUnit.DAYS);
        Instant day2 = now.plus(2, ChronoUnit.DAYS);
        Instant day3 = now.plus(3, ChronoUnit.DAYS);

        List<TravelTrip> trips = List.of(
            // Xe khách (BUS)
            new TravelTrip(UUID.randomUUID(), TripType.BUS, "Phương Trang (FUTA Bus)",
                "Hà Nội", "Sa Pa", tomorrow.plus(8, ChronoUnit.HOURS), tomorrow.plus(14, ChronoUnit.HOURS),
                new BigDecimal("280000"), 40, 40),
            new TravelTrip(UUID.randomUUID(), TripType.BUS, "Thành Bưởi",
                "TP. Hồ Chí Minh", "Đà Lạt", tomorrow.plus(22, ChronoUnit.HOURS), day2.plus(6, ChronoUnit.HOURS),
                new BigDecimal("300000"), 34, 34),
            new TravelTrip(UUID.randomUUID(), TripType.BUS, "Hoàng Long",
                "Hà Nội", "Hải Phòng", day2.plus(7, ChronoUnit.HOURS), day2.plus(9, ChronoUnit.HOURS),
                new BigDecimal("120000"), 45, 45),
            new TravelTrip(UUID.randomUUID(), TripType.BUS, "Phương Trang (FUTA Bus)",
                "TP. Hồ Chí Minh", "Cần Thơ", day2.plus(9, ChronoUnit.HOURS), day2.plus(13, ChronoUnit.HOURS),
                new BigDecimal("165000"), 40, 40),

            // Máy bay (FLIGHT)
            new TravelTrip(UUID.randomUUID(), TripType.FLIGHT, "Vietnam Airlines",
                "Hà Nội", "TP. Hồ Chí Minh", tomorrow.plus(6, ChronoUnit.HOURS), tomorrow.plus(8, ChronoUnit.HOURS),
                new BigDecimal("1850000"), 180, 180),
            new TravelTrip(UUID.randomUUID(), TripType.FLIGHT, "Vietjet Air",
                "TP. Hồ Chí Minh", "Đà Nẵng", tomorrow.plus(10, ChronoUnit.HOURS), tomorrow.plus(11, ChronoUnit.HOURS).plus(30, ChronoUnit.MINUTES),
                new BigDecimal("980000"), 180, 180),
            new TravelTrip(UUID.randomUUID(), TripType.FLIGHT, "Bamboo Airways",
                "Hà Nội", "Đà Nẵng", day2.plus(14, ChronoUnit.HOURS), day2.plus(15, ChronoUnit.HOURS).plus(30, ChronoUnit.MINUTES),
                new BigDecimal("1250000"), 150, 150),
            new TravelTrip(UUID.randomUUID(), TripType.FLIGHT, "Vietjet Air",
                "Hà Nội", "Phú Quốc", day3.plus(7, ChronoUnit.HOURS), day3.plus(9, ChronoUnit.HOURS).plus(15, ChronoUnit.MINUTES),
                new BigDecimal("1450000"), 180, 180),

            // Tàu hoả (TRAIN)
            new TravelTrip(UUID.randomUUID(), TripType.TRAIN, "Đường Sắt Việt Nam (Tàu SE1)",
                "Hà Nội", "TP. Hồ Chí Minh", tomorrow.plus(20, ChronoUnit.HOURS), day3.plus(5, ChronoUnit.HOURS),
                new BigDecimal("1150000"), 120, 120),
            new TravelTrip(UUID.randomUUID(), TripType.TRAIN, "Đường Sắt Việt Nam (Tàu SE3)",
                "Hà Nội", "Đà Nẵng", day2.plus(19, ChronoUnit.HOURS), day3.plus(11, ChronoUnit.HOURS),
                new BigDecimal("650000"), 100, 100),
            new TravelTrip(UUID.randomUUID(), TripType.TRAIN, "Đường Sắt Việt Nam (Tàu SPT2)",
                "TP. Hồ Chí Minh", "Phan Thiết", tomorrow.plus(6, ChronoUnit.HOURS).plus(45, ChronoUnit.MINUTES), tomorrow.plus(10, ChronoUnit.HOURS).plus(30, ChronoUnit.MINUTES),
                new BigDecimal("220000"), 80, 80)
        );

        repository.saveAll(trips);
    }
}
