import React from 'react';
import { View, Text } from 'react-native';

type AppointmentCardProps = {
  appointment: {
    id: string;
    serviceId: string;
    staffId: string;
    date: string; // ISO date string
    timeRange: string;
    note: string;
    createdAt: string; // ISO date string
  };
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  return (
    <View className="mb-4 p-4 bg-white rounded-lg shadow">
      <Text className="font-semibold">Service ID: {appointment.serviceId}</Text>
      <Text>Date: {new Date(appointment.date).toLocaleDateString()}</Text>
      <Text>Time: {appointment.timeRange}</Text>
      <Text>Note: {appointment.note}</Text>
      <Text>Created At: {new Date(appointment.createdAt).toLocaleString()}</Text>
    </View>
  );
};

export default AppointmentCard;
