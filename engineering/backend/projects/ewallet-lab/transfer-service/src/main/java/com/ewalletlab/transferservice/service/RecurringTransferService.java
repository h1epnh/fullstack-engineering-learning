package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.domain.RecurringExecutionStatus;
import com.ewalletlab.transferservice.domain.RecurringFrequency;
import com.ewalletlab.transferservice.domain.RecurringTransfer;
import com.ewalletlab.transferservice.domain.RecurringTransferLog;
import com.ewalletlab.transferservice.domain.RecurringTransferStatus;
import com.ewalletlab.transferservice.repository.RecurringTransferLogRepository;
import com.ewalletlab.transferservice.repository.RecurringTransferRepository;
import com.ewalletlab.transferservice.web.dto.CreateRecurringTransferRequestDto;
import com.ewalletlab.transferservice.web.dto.RecurringRunSummaryDto;
import com.ewalletlab.transferservice.web.dto.RecurringTransferDto;
import com.ewalletlab.transferservice.web.dto.RecurringTransferLogDto;
import com.ewalletlab.transferservice.web.dto.TransferRequestDto;
import com.ewalletlab.transferservice.web.dto.UpdateRecurringStatusRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RecurringTransferService {

    private static final Logger log = LoggerFactory.getLogger(RecurringTransferService.class);
    public static final ZoneId ZONE_VN = ZoneId.of("Asia/Ho_Chi_Minh");
    public static final BigDecimal STEP_UP_THRESHOLD = new BigDecimal("10000000"); // 10M VND (Issue #15)

    private final RecurringTransferRepository recurringTransferRepository;
    private final RecurringTransferLogRepository recurringTransferLogRepository;
    private final TransferService transferService;
    private final UserServiceClient userServiceClient;
    private final Clock clock;

    public RecurringTransferService(RecurringTransferRepository recurringTransferRepository,
                                  RecurringTransferLogRepository recurringTransferLogRepository,
                                  TransferService transferService,
                                  UserServiceClient userServiceClient,
                                  Clock clock) {
        this.recurringTransferRepository = recurringTransferRepository;
        this.recurringTransferLogRepository = recurringTransferLogRepository;
        this.transferService = transferService;
        this.userServiceClient = userServiceClient;
        this.clock = clock;
    }

    @Transactional
    public RecurringTransferDto create(CreateRecurringTransferRequestDto request) {
        UserServiceClient.UserResponse recipient;
        try {
            recipient = userServiceClient.findByPhone(request.recipientPhone());
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận với số điện thoại này");
        }

        if (recipient.id().equals(request.senderId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể lập lịch chuyển tiền cho chính mình");
        }

        validateExecutionDay(request.frequency(), request.executionDay());

        LocalDate today = LocalDate.now(clock.withZone(ZONE_VN));
        LocalDate nextExecution = computeInitialNextExecutionDate(
            request.frequency(), request.executionDay(), request.startDate(), today);

        if (request.endDate() != null && nextExecution.isAfter(request.endDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày kết thúc phải sau ngày thực thi đầu tiên");
        }

        RecurringTransfer entity = new RecurringTransfer(
            request.senderId(),
            request.recipientPhone(),
            recipient.id(),
            request.amount(),
            request.message(),
            request.frequency(),
            request.executionDay(),
            request.startDate(),
            request.endDate(),
            nextExecution
        );

        RecurringTransfer saved = recurringTransferRepository.save(entity);
        return RecurringTransferDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringTransferDto> listBySender(UUID senderId) {
        return recurringTransferRepository.findBySenderIdOrderByCreatedAtDesc(senderId)
            .stream()
            .map(RecurringTransferDto::from)
            .toList();
    }

    @Transactional
    public RecurringTransferDto updateStatus(UUID id, UpdateRecurringStatusRequestDto request) {
        RecurringTransfer transfer = recurringTransferRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch chuyển tiền"));

        transfer.setStatus(request.status());
        RecurringTransfer saved = recurringTransferRepository.save(transfer);
        return RecurringTransferDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RecurringTransferLogDto> getLogs(UUID recurringTransferId) {
        return recurringTransferLogRepository.findByRecurringTransferIdOrderByExecutedAtDesc(recurringTransferId)
            .stream()
            .map(RecurringTransferLogDto::from)
            .toList();
    }

    @Transactional
    public RecurringRunSummaryDto triggerRun() {
        LocalDate today = LocalDate.now(clock.withZone(ZONE_VN));
        List<RecurringTransfer> dueTransfers = recurringTransferRepository
            .findByStatusAndNextExecutionDateLessThanEqual(RecurringTransferStatus.ACTIVE, today);

        int scanned = dueTransfers.size();
        int success = 0;
        int failed = 0;
        int skipped = 0;
        List<RecurringTransferLogDto> logs = new ArrayList<>();

        for (RecurringTransfer transfer : dueTransfers) {
            // Idempotency: Do not execute twice on the same day for the same schedule
            if (transfer.getLastExecutionDate() != null && transfer.getLastExecutionDate().equals(today)) {
                log.info("Schedule {} already executed today ({}), skipping", transfer.getId(), today);
                skipped++;
                continue;
            }

            // Step-up restriction (Issue #15 / QD 2345): background scheduler cannot prompt biometrics
            if (transfer.getAmount().compareTo(STEP_UP_THRESHOLD) > 0) {
                log.warn("Schedule {} amount {} exceeds step-up threshold (10M), failing automatically",
                    transfer.getId(), transfer.getAmount());
                RecurringTransferLog failLog = recurringTransferLogRepository.save(new RecurringTransferLog(
                    transfer.getId(),
                    transfer.getAmount(),
                    RecurringExecutionStatus.FAILED_STEP_UP_REQUIRED,
                    "Số tiền vượt 10.000.000đ yêu cầu xác thực khuôn mặt trực tiếp theo QĐ 2345/QĐ-NHNN, không thể tự động chuyển"
                ));
                logs.add(RecurringTransferLogDto.from(failLog));
                advanceSchedule(transfer, today);
                failed++;
                continue;
            }

            try {
                transferService.transfer(new TransferRequestDto(
                    transfer.getSenderId(),
                    transfer.getRecipientPhone(),
                    transfer.getAmount(),
                    false
                ));

                RecurringTransferLog successLog = recurringTransferLogRepository.save(new RecurringTransferLog(
                    transfer.getId(),
                    transfer.getAmount(),
                    RecurringExecutionStatus.SUCCESS,
                    null
                ));
                logs.add(RecurringTransferLogDto.from(successLog));
                advanceSchedule(transfer, today);
                success++;
            } catch (ResponseStatusException e) {
                log.warn("Recurring transfer {} failed: status {} reason {}", transfer.getId(), e.getStatusCode(), e.getReason());
                RecurringExecutionStatus status = RecurringExecutionStatus.FAILED_INSUFFICIENT_FUNDS;
                if (e.getStatusCode().value() == 428) {
                    status = RecurringExecutionStatus.FAILED_STEP_UP_REQUIRED;
                }
                RecurringTransferLog errLog = recurringTransferLogRepository.save(new RecurringTransferLog(
                    transfer.getId(),
                    transfer.getAmount(),
                    status,
                    e.getReason() != null ? e.getReason() : e.getMessage()
                ));
                logs.add(RecurringTransferLogDto.from(errLog));
                advanceSchedule(transfer, today);
                failed++;
            } catch (Exception e) {
                log.error("Unexpected error executing recurring transfer {}: {}", transfer.getId(), e.getMessage(), e);
                RecurringTransferLog errLog = recurringTransferLogRepository.save(new RecurringTransferLog(
                    transfer.getId(),
                    transfer.getAmount(),
                    RecurringExecutionStatus.FAILED_LIMIT_EXCEEDED,
                    e.getMessage()
                ));
                logs.add(RecurringTransferLogDto.from(errLog));
                advanceSchedule(transfer, today);
                failed++;
            }
        }

        return new RecurringRunSummaryDto(scanned, success, failed, skipped, logs);
    }

    private void advanceSchedule(RecurringTransfer transfer, LocalDate today) {
        LocalDate nextDate = computeNextExecutionDate(
            transfer.getFrequency(), transfer.getExecutionDay(), today.plusDays(1));
        transfer.setLastExecutionDate(today);
        transfer.setNextExecutionDate(nextDate);

        if (transfer.getEndDate() != null && nextDate.isAfter(transfer.getEndDate())) {
            log.info("Schedule {} reached end date {}, setting CANCELLED", transfer.getId(), transfer.getEndDate());
            transfer.setStatus(RecurringTransferStatus.CANCELLED);
        }

        recurringTransferRepository.save(transfer);
    }

    private void validateExecutionDay(RecurringFrequency frequency, int executionDay) {
        if (frequency == RecurringFrequency.WEEKLY) {
            if (executionDay < 1 || executionDay > 7) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày trong tuần phải từ 1 (Thứ Hai) đến 7 (Chủ Nhật)");
            }
        } else if (frequency == RecurringFrequency.MONTHLY) {
            if (executionDay < 1 || executionDay > 28) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày trong tháng phải từ 1 đến 28");
            }
        }
    }

    public static LocalDate computeInitialNextExecutionDate(RecurringFrequency frequency, int executionDay,
                                                            LocalDate startDate, LocalDate today) {
        LocalDate baseDate = startDate.isAfter(today) ? startDate : today;
        return computeNextExecutionDate(frequency, executionDay, baseDate);
    }

    public static LocalDate computeNextExecutionDate(RecurringFrequency frequency, int executionDay, LocalDate fromDate) {
        if (frequency == RecurringFrequency.WEEKLY) {
            DayOfWeek targetDow = DayOfWeek.of(executionDay);
            LocalDate candidate = fromDate;
            while (candidate.getDayOfWeek() != targetDow) {
                candidate = candidate.plusDays(1);
            }
            return candidate;
        } else {
            YearMonth ym = YearMonth.from(fromDate);
            LocalDate candidate = ym.atDay(executionDay);
            if (candidate.isBefore(fromDate)) {
                candidate = ym.plusMonths(1).atDay(executionDay);
            }
            return candidate;
        }
    }
}
