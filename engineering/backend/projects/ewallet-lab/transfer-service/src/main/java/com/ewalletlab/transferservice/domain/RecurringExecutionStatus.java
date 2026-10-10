package com.ewalletlab.transferservice.domain;

public enum RecurringExecutionStatus {
    SUCCESS,
    FAILED_INSUFFICIENT_FUNDS,
    FAILED_STEP_UP_REQUIRED,
    FAILED_LIMIT_EXCEEDED
}
