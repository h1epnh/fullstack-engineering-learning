package com.ewalletlab.topupservice.web;

import com.ewalletlab.topupservice.service.GameCardService;
import com.ewalletlab.topupservice.web.dto.CreateGameCardOrderRequestDto;
import com.ewalletlab.topupservice.web.dto.GameCardOrderDto;
import com.ewalletlab.topupservice.web.dto.GameCardPackageDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/telco/game-cards")
public class GameCardController {

    private final GameCardService gameCardService;

    public GameCardController(GameCardService gameCardService) {
        this.gameCardService = gameCardService;
    }

    @GetMapping("/packages")
    public List<GameCardPackageDto> getPackages() {
        return gameCardService.getAvailablePackages();
    }

    @PostMapping
    public ResponseEntity<GameCardOrderDto> purchaseGameCard(@Valid @RequestBody CreateGameCardOrderRequestDto request) {
        GameCardOrderDto order = gameCardService.purchaseGameCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping
    public List<GameCardOrderDto> getOrders(@RequestParam UUID userId) {
        return gameCardService.getOrdersByUserId(userId);
    }

    @ExceptionHandler(HttpClientErrorException.Conflict.class)
    public ResponseEntity<String> handleConflict(HttpClientErrorException.Conflict e) {
        String msg = e.getResponseBodyAsString();
        if (msg.isBlank()) {
            msg = "Số dư ví không đủ hoặc vượt hạn mức tháng";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(msg);
    }

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<String> handleHttpClientError(HttpClientErrorException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
    }
}
