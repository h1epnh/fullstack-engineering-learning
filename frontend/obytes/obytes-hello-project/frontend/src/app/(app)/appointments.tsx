import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '@/lib/auth';
import AppointmentCard from '@/components/appointments/AppointmentCard';
import Timeline from '@/components/appointments/Timeline';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchAppointments, searchAppointmentsByFilters } from '@/api/appointment/appointment';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const loadAppointments = async () => {
    const token = getToken();
    try {
      const appointmentsData = await fetchAppointments(token);
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsByFilters = async () => {
    const token = getToken();
    try {
      const appointmentsData = await searchAppointmentsByFilters(token, searchQuery);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, [getToken]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleCloseAppointment = (id: string) => {
    setAppointments((prevAppointments) => 
      prevAppointments.filter((appointment) => appointment.id !== id)
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row items-center border border-gray-300 rounded p-2 mb-4">
          <Icon name="search" size={20} color="#000" className="mr-2" /> 
          <TextInput
            placeholder="Search appointments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onBlur={loadAppointmentsByFilters}
            style={{ flex: 1, padding: 0 }}
          />
        </View>
      </View>
      <ScrollView
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-center mb-6">
          <Icon name="clipboard" size={30} color="#000" />
          <Text className="ml-2 text-3xl font-bold">Your Appointments</Text>
        </View>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2">Loading appointments...</Text>
          </View>
        ) : appointments.length === 0 ? (
          <Text className="text-center text-lg">No appointments found.</Text>
        ) : (
          <Timeline appointments={appointments.map(appointment => ({ 
            ...appointment, 
            onClose: handleCloseAppointment 
          }))} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
