package com.ewalletlab.transferservice.web;

import com.ewalletlab.transferservice.service.TransferService;
import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.TransferResponseDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

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
}
