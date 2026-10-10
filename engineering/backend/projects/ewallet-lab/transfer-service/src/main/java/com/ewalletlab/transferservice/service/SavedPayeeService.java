package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.domain.SavedPayee;
import com.ewalletlab.transferservice.repository.SavedPayeeRepository;
import com.ewalletlab.transferservice.web.dto.CreatePayeeRequestDto;
import com.ewalletlab.transferservice.web.dto.SavedPayeeDto;
import com.ewalletlab.transferservice.web.dto.UpdatePayeeRequestDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class SavedPayeeService {

    private final SavedPayeeRepository savedPayeeRepository;
    private final UserServiceClient userServiceClient;

    public SavedPayeeService(SavedPayeeRepository savedPayeeRepository, UserServiceClient userServiceClient) {
        this.savedPayeeRepository = savedPayeeRepository;
        this.userServiceClient = userServiceClient;
    }

    @Transactional(readOnly = true)
    public List<SavedPayeeDto> listPayees(UUID userId) {
        return savedPayeeRepository
            .findByUserIdOrderByIsFavoriteDescLastTransferredAtDescCreatedAtDesc(userId)
            .stream()
            .map(SavedPayeeDto::from)
            .toList();
    }

    @Transactional
    public SavedPayeeDto savePayee(UUID userId, CreatePayeeRequestDto request) {
        UserServiceClient.UserResponse recipient;
        try {
            recipient = userServiceClient.findByPhone(request.payeePhone());
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với số điện thoại này");
        }

        if (recipient.id().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể lưu chính mình vào danh bạ");
        }

        if (savedPayeeRepository.existsByUserIdAndPayeePhone(userId, request.payeePhone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Người nhận này đã có trong danh bạ");
        }

        boolean favorite = request.isFavorite() != null && request.isFavorite();
        SavedPayee payee = new SavedPayee(userId, request.payeePhone(), recipient.name(), request.nickname(), favorite);
        SavedPayee saved = savedPayeeRepository.save(payee);
        return SavedPayeeDto.from(saved);
    }

    @Transactional
    public SavedPayeeDto updatePayee(UUID userId, UUID id, UpdatePayeeRequestDto request) {
        SavedPayee payee = savedPayeeRepository.findByUserIdAndId(userId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người thụ hưởng trong danh bạ"));

        if (request.nickname() != null) {
            payee.setNickname(request.nickname().trim().isEmpty() ? null : request.nickname().trim());
        }
        if (request.isFavorite() != null) {
            payee.setFavorite(request.isFavorite());
        }

        SavedPayee updated = savedPayeeRepository.save(payee);
        return SavedPayeeDto.from(updated);
    }

    @Transactional
    public void deletePayee(UUID userId, UUID id) {
        SavedPayee payee = savedPayeeRepository.findByUserIdAndId(userId, id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người thụ hưởng trong danh bạ"));
        savedPayeeRepository.delete(payee);
    }

    @Transactional
    public void recordTransfer(UUID userId, String payeePhone) {
        savedPayeeRepository.findByUserIdAndPayeePhone(userId, payeePhone).ifPresent(payee -> {
            payee.setLastTransferredAt(Instant.now());
            savedPayeeRepository.save(payee);
        });
    }
}
