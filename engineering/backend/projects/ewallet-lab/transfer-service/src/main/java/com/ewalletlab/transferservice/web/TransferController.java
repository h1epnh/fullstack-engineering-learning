package com.ewalletlab.transferservice.web;

import com.ewalletlab.transferservice.service.TransferService;
import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.TransferResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/transfers")
    public TransferResponseDto transfer(@Valid @RequestBody TransferRequestDto request) {
        return transferService.transfer(request);
    }

    /**
     * Issue #15 — {@code TransferService} throws {@code ResponseStatusException} for every error
     * case (recipient not found, self-transfer, insufficient balance, step-up required, saga
     * failure). Without this handler, Spring's default `/error` JSON body omits the `message` field
     * unless `server.error.include-message` is set — this returns the reason as a plain-text body
     * instead, matching every other handled error in this codebase, so the frontend's step-up modal
     * can show the exact, sourced Vietnamese copy for a 428 instead of an empty/generic message.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatusException(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
    }
}
