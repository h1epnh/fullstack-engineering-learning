package com.ewalletlab.transferservice.service;

import com.ewalletlab.transferservice.domain.RecurringFrequency;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RecurringTransferServiceTest {

    @Test
    void testComputeInitialNextExecutionDateWeekly() {
        // 2026-10-09 is Friday (DayOfWeek = 5)
        LocalDate today = LocalDate.of(2026, 10, 9);
        LocalDate startDate = LocalDate.of(2026, 10, 9);

        // Weekly on Friday (5) -> today
        LocalDate nextFri = RecurringTransferService.computeInitialNextExecutionDate(
            RecurringFrequency.WEEKLY, 5, startDate, today);
        assertEquals(LocalDate.of(2026, 10, 9), nextFri);

        // Weekly on Monday (1) -> next Monday 2026-10-12
        LocalDate nextMon = RecurringTransferService.computeInitialNextExecutionDate(
            RecurringFrequency.WEEKLY, 1, startDate, today);
        assertEquals(LocalDate.of(2026, 10, 12), nextMon);
    }

    @Test
    void testComputeNextExecutionDateAfterExecutionWeekly() {
        // Today is Friday 2026-10-09. After running today, next run starts from tomorrow (2026-10-10)
        LocalDate tomorrow = LocalDate.of(2026, 10, 10);
        LocalDate nextFri = RecurringTransferService.computeNextExecutionDate(
            RecurringFrequency.WEEKLY, 5, tomorrow);
        assertEquals(LocalDate.of(2026, 10, 16), nextFri);
    }

    @Test
    void testComputeInitialNextExecutionDateMonthly() {
        LocalDate today = LocalDate.of(2026, 10, 9);
        LocalDate startDate = LocalDate.of(2026, 10, 9);

        // Monthly on day 9 -> today
        LocalDate day9 = RecurringTransferService.computeInitialNextExecutionDate(
            RecurringFrequency.MONTHLY, 9, startDate, today);
        assertEquals(LocalDate.of(2026, 10, 9), day9);

        // Monthly on day 15 -> 2026-10-15
        LocalDate day15 = RecurringTransferService.computeInitialNextExecutionDate(
            RecurringFrequency.MONTHLY, 15, startDate, today);
        assertEquals(LocalDate.of(2026, 10, 15), day15);

        // Monthly on day 5 (already passed in Oct) -> 2026-11-05
        LocalDate day5 = RecurringTransferService.computeInitialNextExecutionDate(
            RecurringFrequency.MONTHLY, 5, startDate, today);
        assertEquals(LocalDate.of(2026, 11, 5), day5);
    }

    @Test
    void testComputeNextExecutionDateAfterExecutionMonthly() {
        // Ran on day 9 of Oct (2026-10-09). Next from tomorrow (2026-10-10) -> 2026-11-09
        LocalDate tomorrow = LocalDate.of(2026, 10, 10);
        LocalDate nextDay9 = RecurringTransferService.computeNextExecutionDate(
            RecurringFrequency.MONTHLY, 9, tomorrow);
        assertEquals(LocalDate.of(2026, 11, 9), nextDay9);
    }
}
