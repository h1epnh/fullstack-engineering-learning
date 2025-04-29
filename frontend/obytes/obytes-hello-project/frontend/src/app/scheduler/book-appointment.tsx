import {
  type IAppointment,
  type IAvailableDates,
  TimeSlotPicker,
} from '@dgreasi/react-native-time-slot-picker';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { showMessage } from 'react-native-flash-message';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextInput, Text, View, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import { type Post, useAddPost } from '@/api';
import { Card } from '@/components/card';
import {
  Button,
  ControlledInput,
  FocusAwareStatusBar,
  SafeAreaView,
  showErrorMessage,
} from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { fetchServices } from '@/api/services/services';
import { fetchStaffs } from '@/api/staff/staff';
import { AVAILABLE_DATES } from '@/lib/appointments/timeSlots';

const schema = z.object({
  note: z.string().min(20),
});

type FormType = z.infer<typeof schema>;

export default function BookAppointment() {
  const { control, handleSubmit } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const { mutate: addPost, isPending } = useAddPost();
  const { getToken } = useAuth();

  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [dateOfAppointment, setDateOfAppointment] = useState<IAppointment | null>(null);
  const [timeRange, setTimeRange] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<{ id: number; name: string } | null>(null);
  const [services, setServices] = useState<{ id: number; name: string }[]>([]);
  const [staffs, setStaffs] = useState<{ id: number; name: string; avatarUrl: string }[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<{ id: number; name: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await fetchServices();
        setServices(servicesData);
      } catch (error) {
        showErrorMessage('Failed to load services');
      }
    };

    const loadStaffs = async () => {
      try {
        const staffsData = await fetchStaffs();
        setStaffs(staffsData);
      } catch (error) {
        showErrorMessage('Failed to load staffs');
      }
    };

    loadStaffs();
    loadServices();
  }, []);

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = async (data: FormType) => {
    try {
      const token = getToken();
      const user = jwtDecode(token?.access || '');

      const appointmentData = {
        userId: user?.userId || '',
        serviceId: selectedService?.id,
        staffId: selectedStaff?.id,
        date: dateOfAppointment?.date || '',
        timeRange: timeRange,
        note: data.note,
      };

      if (appointmentId) {
        await axios.put(`http://localhost:3000/api/appointments/${appointmentId}`, {
          timeRange: timeRange,
          note: data.note,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access}`,
          },
        });
        showMessage({
          message: 'Appointment updated successfully',
          type: 'success',
        });
      } else {
        const response = await axios.post('http://localhost:3000/api/appointments', appointmentData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.access}`,
          },
        });
        setAppointmentId(response.data);
        showMessage({
          message: 'Appointment registered successfully',
          type: 'success',
        });
      }
    } catch (error) {
      showErrorMessage('Error processing appointment');
      console.error(error);
    }
  };

  const handleDateChange = React.useCallback(
    (appointment: IAppointment | null) => {
      setDateOfAppointment(appointment);
      if (appointment) {
        if (appointment.id) {
          setAppointmentId(appointment.id);
        }
        if (appointment.appointmentDate) {
          setDateOfAppointment({ ...dateOfAppointment, date: appointment.appointmentDate });
        }
        if (appointment.appointmentTime) {
          setTimeRange(appointment.appointmentTime);
        }
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
      <ScrollView className="flex-1">
        <View className="p-4">
          <TextInput
            placeholder="Search for services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 5,
              padding: 10,
              marginBottom: 20,
            }}
          />

          {searchQuery.length > 0 && (
            <View style={{ maxHeight: 150, marginBottom: 20 }}>
              <FlatList
                data={filteredServices}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedService(item);
                      setSearchQuery(item.name);
                    }}
                    style={{
                      padding: 10,
                      borderBottomWidth: 1,
                      borderBottomColor: '#ccc',
                    }}
                  >
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {selectedService && (
            <Text style={{ marginTop: 0, marginBottom: 10 }}>Selected Service: {selectedService.name}</Text>
          )}

          <ControlledInput
            name="note"
            control={control}
            multiline
            placeholder="Enter your notes here..."
            testID="note-input"
          />

          <View className="mt-4 mb-4">
            <Text className="text-xl font-bold mb-4">Your Staff</Text>
            {staffs.length > 0 && 
              staffs.map((staff) => (
                <TouchableOpacity
                  key={staff.id}
                  onPress={() => setSelectedStaff(staff)}
                  className={`mb-2 ${selectedStaff?.id === staff.id ? 'bg-primary/10' : 'bg-white'}`}
                >
                  <View className="flex-row items-center p-4 rounded-lg">
                    <View className="relative">
                      <Image
                        source={{ uri: staff.avatarUrl }}
                        className="size-16 rounded-full"
                        contentFit="cover"
                      />
                      {selectedStaff?.id === staff.id && (
                        <View className="absolute -top-1 -right-1 size-5 rounded-full bg-green-500 items-center justify-center">
                          <Text className="text-white text-xs">✓</Text>
                        </View>
                      )}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-semibold">{staff.name}</Text>
                      <Text className="text-gray-600">Senior Nail Artist</Text>
                      <Text className="text-gray-500">5 years experience</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            }
          </View>

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

          <Button
            label="Book Appointment"
            loading={isPending}
            onPress={() => {
              handleSubmit(onSubmit)();
            }}
            testID="btn-book-appointment"
          />
        </View>
      </ScrollView>
    </>
  );
}
