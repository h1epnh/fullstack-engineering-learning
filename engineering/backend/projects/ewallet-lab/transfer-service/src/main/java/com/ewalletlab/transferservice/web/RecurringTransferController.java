package com.ewalletlab.transferservice.web;

import com.ewalletlab.transferservice.service.RecurringTransferService;
import com.ewalletlab.transferservice.web.dto.CreateRecurringTransferRequestDto;
import com.ewalletlab.transferservice.web.dto.RecurringRunSummaryDto;
import com.ewalletlab.transferservice.web.dto.RecurringTransferDto;
import com.ewalletlab.transferservice.web.dto.RecurringTransferLogDto;
import com.ewalletlab.transferservice.web.dto.UpdateRecurringStatusRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recurring-transfers")
public class RecurringTransferController {

    private final RecurringTransferService recurringTransferService;

    public RecurringTransferController(RecurringTransferService recurringTransferService) {
        this.recurringTransferService = recurringTransferService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecurringTransferDto create(@Valid @RequestBody CreateRecurringTransferRequestDto request) {
        return recurringTransferService.create(request);
    }

    @GetMapping
    public List<RecurringTransferDto> listBySender(@RequestParam UUID senderId) {
        return recurringTransferService.listBySender(senderId);
    }

    @PutMapping("/{id}/status")
    public RecurringTransferDto updateStatus(@PathVariable UUID id,
                                           @Valid @RequestBody UpdateRecurringStatusRequestDto request) {
        return recurringTransferService.updateStatus(id, request);
    }

    @GetMapping("/{id}/logs")
    public List<RecurringTransferLogDto> getLogs(@PathVariable UUID id) {
        return recurringTransferService.getLogs(id);
    }

    @PostMapping("/trigger-run")
    public RecurringRunSummaryDto triggerRun() {
        return recurringTransferService.triggerRun();
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of(
            "status", ex.getStatusCode().value(),
            "error", ex.getReason() != null ? ex.getReason() : "Error",
            "message", ex.getReason() != null ? ex.getReason() : "Error"
        ));
    }
}
