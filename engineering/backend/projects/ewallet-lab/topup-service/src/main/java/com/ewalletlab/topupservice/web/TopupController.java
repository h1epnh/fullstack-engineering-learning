package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.domain.TopupRequest;
import com.ewalletlab.topupservice.repository.TopupRequestRepository;
import com.ewalletlab.topupservice.service.TopupService;
import com.ewalletlab.topupservice.web.dto.TopupRequestDto;
import com.ewalletlab.topupservice.web.dto.TopupResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/topups")
public class TopupController {

    private final TopupService topupService;
    private final TopupRequestRepository topupRequestRepository;

    public TopupController(TopupService topupService, TopupRequestRepository topupRequestRepository) {
        this.topupService = topupService;
        this.topupRequestRepository = topupRequestRepository;
    }

    /**
     * Returns as soon as mock-bank-gateway ACKs — status will be PENDING here, not SUCCESS. Poll
     * GET /topups/{orderId} (or, in a real app, listen for a push notification) to see it flip to
     * CONFIRMED once the IPN lands.
     */
    @PostMapping
    public ResponseEntity<TopupResponseDto> initiate(@Valid @RequestBody TopupRequestDto request) {
        TopupRequest topupRequest = topupService.initiate(request.userId(), request.amount());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(TopupResponseDto.from(topupRequest));
    }

    @GetMapping("/{orderId}")
    public TopupResponseDto get(@PathVariable String orderId) {
        return topupRequestRepository.findByOrderId(orderId)
            .map(TopupResponseDto::from)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topup not found: " + orderId));
    }
}
