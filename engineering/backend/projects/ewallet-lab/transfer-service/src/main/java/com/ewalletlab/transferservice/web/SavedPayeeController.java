package com.ewalletlab.transferservice.web;

import com.ewalletlab.transferservice.service.SavedPayeeService;
import com.ewalletlab.transferservice.web.dto.CreatePayeeRequestDto;
import com.ewalletlab.transferservice.web.dto.RecordTransferRequestDto;
import com.ewalletlab.transferservice.web.dto.SavedPayeeDto;
import com.ewalletlab.transferservice.web.dto.UpdatePayeeRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/users/{userId}/payees", "/payees/{userId}"})
public class SavedPayeeController {

    private final SavedPayeeService savedPayeeService;

    public SavedPayeeController(SavedPayeeService savedPayeeService) {
        this.savedPayeeService = savedPayeeService;
    }

    @GetMapping
    public List<SavedPayeeDto> listPayees(@PathVariable UUID userId) {
        return savedPayeeService.listPayees(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SavedPayeeDto savePayee(@PathVariable UUID userId, @Valid @RequestBody CreatePayeeRequestDto request) {
        return savedPayeeService.savePayee(userId, request);
    }

    @PutMapping("/{id}")
    public SavedPayeeDto updatePayee(@PathVariable UUID userId, @PathVariable UUID id,
                                   @RequestBody UpdatePayeeRequestDto request) {
        return savedPayeeService.updatePayee(userId, id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePayee(@PathVariable UUID userId, @PathVariable UUID id) {
        savedPayeeService.deletePayee(userId, id);
    }

    @PostMapping("/record-transfer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void recordTransfer(@PathVariable UUID userId, @Valid @RequestBody RecordTransferRequestDto request) {
        savedPayeeService.recordTransfer(userId, request.payeePhone());
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
