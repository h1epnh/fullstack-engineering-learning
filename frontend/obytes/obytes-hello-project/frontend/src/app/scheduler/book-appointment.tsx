import {
  type IAppointment,
  type IAvailableDates,
  TimeSlotPicker,
} from '@dgreasi/react-native-time-slot-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';

import { type Post, useAddPost } from '@/api';
import { Card } from '@/components/card';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  SafeAreaView,
  showErrorMessage,
  View,
} from '@/components/ui';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

type FormType = z.infer<typeof schema>;

// Types
type TimeSlotConfig = {
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  excludeWeekends?: boolean;
  daysToGenerate?: number;
  lunchBreakStart?: number;
  lunchBreakEnd?: number;
  disabledSlots?: string[]; // Add this type
};

// Utility Functions
function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number,
  lunchBreakStart?: number,
  lunchBreakEnd?: number,
  disabledSlots: string[] = [] // Add this parameter
): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    // Skip lunch break hours
    if (
      lunchBreakStart &&
      lunchBreakEnd &&
      hour >= lunchBreakStart &&
      hour < lunchBreakEnd
    ) {
      continue;
    }

    const currentSlots = [];
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      const endHour = minute + intervalMinutes >= 60 ? hour + 1 : hour;
      const endMinute = (minute + intervalMinutes) % 60;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute
        .toString()
        .padStart(2, '0')}`;

      // currentSlots.push(`${startTime}-${endTime}`);
      const slot = `${startTime}-${endTime}`;
      // Only add slot if it's not in disabledSlots
      if (!disabledSlots.includes(slot)) {
        currentSlots.push(slot);
      }
    }
    slots.push(...currentSlots);
  }
  return slots;
}

function generateAvailableDates({
  startHour = 9,
  endHour = 17,
  intervalMinutes = 60,
  excludeWeekends = true,
  daysToGenerate = 7,
  lunchBreakStart = 12,
  lunchBreakEnd = 13,
  disabledSlots = [], // Add this parameter
}: TimeSlotConfig): IAvailableDates[] {
  const dates: IAvailableDates[] = [];

  for (let i = 0; i < daysToGenerate; i++) {
    const date = addDays(new Date(), i);
    // Set time to start of day to avoid timezone issues
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
}

// Generate available dates with custom configuration
const AVAILABLE_DATES = generateAvailableDates({
  startHour: 9, // 9 AM
  endHour: 22, // 5 PM
  intervalMinutes: 60, // 30-minute slots
  excludeWeekends: false,
  daysToGenerate: 7,
  lunchBreakStart: 12, // 12 PM lunch break start
  lunchBreakEnd: 13, // 1 PM lunch break end
  disabledSlots: ['09:00-10:00', '10:00-11:00'],
}).map((date) => {
  // Disable all slots for specific dates
  if (
    format(parseISO(date.date), 'yyyy-MM-dd') ===
    format(new Date(), 'yyyy-MM-dd')
  ) {
    return {
      ...date,
      slotTimes: [], // Disable all slots for today
    };
  }
  return date;
});

// Debug log to verify generated dates
console.log(
  'Generated dates:',
  AVAILABLE_DATES.map((d) => {
    try {
      return {
        date: d.date,
        parsedDate: format(parseISO(d.date), 'PPP'),
        slots: d.slotTimes.length,
      };
    } catch (error) {
      return {
        date: d.date,
        error: 'Failed to parse date',
        slots: d.slotTimes.length,
      };
    }
  })
);

export default function BookAppointment() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();

  const onSubmit = (data: FormType) => {
    console.log(data);
    addPost(
      { ...data, userId: 1 },
      {
        onSuccess: () => {
          showMessage({
            message: 'Post added successfully',
            type: 'success',
          });
          // here you can navigate to the post list and refresh the list data
          //queryClient.invalidateQueries(usePosts.getKey());
        },
        onError: () => {
          showErrorMessage('Error adding post');
        },
      }
    );
  };

  const [dateOfAppointment, setDateOfAppointment] =
    React.useState<IAppointment | null>(null);

  const renderItem = React.useCallback(
    ({ item }: { item: Post }) => <Card {...item} />,
    []
  );

  const handleDateChange = React.useCallback(
    (appointment: IAppointment | null) => {
      setDateOfAppointment(appointment);
      if (appointment) {
        console.log('Raw appointment data:', appointment);
      }
    },
    []
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Book Appointment',
          headerBackTitle: 'Booking',
        }}
      />
      <View className="flex-1 p-4 ">
        <ControlledInput
          name="title"
          label="Title"
          control={control}
          testID="title"
        />
        <ControlledInput
          name="body"
          label="Content"
          control={control}
          multiline
          testID="body-input"
        />

        <SafeAreaView className="flex-1">
          <FocusAwareStatusBar />

          {/* Time Slot Picker */}
          <View className="bg-white">
            <TimeSlotPicker
              availableDates={AVAILABLE_DATES}
              setDateOfAppointment={handleDateChange}
              theme={{
                backgroundColor: '#ffffff',
                calendarTextColor: '#000000',
                selectedDateBackgroundColor: '#007AFF',
                selectedDateTextColor: '#ffffff',
                dateTextColor: '#000000',
                dayTextColor: '#000000',
                timeSlotTextColor: '#000000',
                timeSlotBackgroundColor: '#f0f0f0',
                selectedTimeSlotBackgroundColor: '#007AFF',
                selectedTimeSlotTextColor: '#ffffff',
              }}
            />
          </View>
        </SafeAreaView>

        <Button
          label="Add Post"
          loading={isPending}
          onPress={handleSubmit(onSubmit)}
          testID="add-post-button"
        />
      </View>
    </>
  );
}
