import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type Appointment = {
  id: string;
  serviceId: string;
  staffId: string;
  date: string; // ISO date string
  timeRange: string;
  note: string;
  createdAt: string; // ISO date string
  status: string; // e.g., "CONFIRMED", "CANCELLED", "PENDING"
  service: {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    imageUrl: string;
  }
  onClose: (id: string) => void;
};

type TimelineProps = {
  appointments: Appointment[];
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return '#d4edda'; // Light green background
    case 'CANCELLED':
      return '#f8d7da'; // Light red background
    case 'PENDING':
      return '#fff3cd'; // Light yellow background
    default:
      return '#e2e3e5'; // Default light gray background
  }
};

const Timeline: React.FC<TimelineProps> = ({ appointments }) => {
  return (
    <View style={styles.timelineContainer}>
      {appointments.map((appointment) => (
        <View key={appointment.id} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          <View style={[styles.timelineContent, { backgroundColor: getStatusColor(appointment.status) }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => appointment.onClose(appointment.id)}>
              <Icon name="times" size={20} color="#FF0000" />
            </TouchableOpacity>
            <Text style={styles.serviceId}>Service Name: {appointment?.service?.name}</Text>
            <Text style={styles.date}>Date: {new Date(appointment.date).toLocaleDateString()}</Text>
            <Text style={styles.time}>Time: <Text style={styles.timeValue}>{appointment.timeRange}</Text></Text>
            <Text style={styles.note}>Note: {appointment.note}</Text>
            <Text style={styles.createdAt}>Created At: {new Date(appointment.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timelineContainer: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  serviceId: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    marginTop: 4,
    fontSize: 14,
  },
  time: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5733',
  },
  note: {
    marginTop: 4,
    fontSize: 14,
  },
  createdAt: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },
});

export default Timeline;
