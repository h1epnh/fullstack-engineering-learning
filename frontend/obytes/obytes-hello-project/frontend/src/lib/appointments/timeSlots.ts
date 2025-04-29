import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';

export type TimeSlotConfig = {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  excludeWeekends?: boolean;
  daysToGenerate?: number;
  lunchBreakStart?: number;
  lunchBreakEnd?: number;
  disabledSlots?: string[];
};

export const defaultTimeSlotConfig: TimeSlotConfig = {
  startHour: 9,
  endHour: 17,
  intervalMinutes: 30,
  excludeWeekends: true,
  daysToGenerate: 7,
  lunchBreakStart: 12,
  lunchBreakEnd: 13,
  disabledSlots: [],
};

// Function to generate time slots
export const generateTimeSlots = (
  startHour: number,
  endHour: number,
  intervalMinutes: number,
  lunchBreakStart?: number,
  lunchBreakEnd?: number,
  disabledSlots: string[] = [] // Add this parameter
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    // Skip lunch break hours
    if (lunchBreakStart && lunchBreakEnd && hour >= lunchBreakStart && hour < lunchBreakEnd) {
      continue;
    }

    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute + intervalMinutes >= 60 ? hour + 1 : hour;
      const endMinute = (minute + intervalMinutes) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      const slot = `${startTime}-${endTime}`;
      // Only add slot if it's not in disabledSlots
      if (!disabledSlots.includes(slot)) {
        slots.push(slot);
      }
    }
  }
  return slots;
};

// Function to generate available dates
export const generateAvailableDates = ({
  startHour = 9,
  endHour = 17,
  intervalMinutes = 60,
  excludeWeekends = true,
  daysToGenerate = 7,
  lunchBreakStart = 12,
  lunchBreakEnd = 13,
  disabledSlots = [],
}: TimeSlotConfig): IAvailableDates[] => {
  const dates: IAvailableDates[] = [];

  for (let i = 0; i < daysToGenerate; i++) {
    const date = addDays(new Date(), i);
    date.setHours(0, 0, 0, 0);
    const isWeekend = [0, 6].includes(date.getDay());

    dates.push({
      date: date.toISOString(),
      slotTimes:
        excludeWeekends && isWeekend
          ? []
          : generateTimeSlots(
              startHour,
              endHour,
              intervalMinutes,
              lunchBreakStart,
              lunchBreakEnd,
              disabledSlots // Pass disabled slots
            ),
    });
  }

  return dates;
};

// Generate available dates with custom configuration
export const AVAILABLE_DATES = generateAvailableDates({
  startHour: 9,
  endHour: 17,
  intervalMinutes: 60,
  excludeWeekends: false,
  daysToGenerate: 7,
  lunchBreakStart: 12,
  lunchBreakEnd: 13,
  disabledSlots: [],
});
