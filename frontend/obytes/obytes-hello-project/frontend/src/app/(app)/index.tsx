import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { Button } from '@/components/ui/button';

// Types
type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string | null;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  experience: string;
};

// Removed mock data for SERVICES
const STAFF: Staff[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Nail Artist',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    experience: '5 years',
  },
  {
    id: '2',
    name: 'Emily Chen',
    role: 'Nail Technician',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    experience: '3 years',
  },
  {
    id: '3',
    name: 'Maria Garcia',
    role: 'Nail Specialist',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    experience: '4 years',
  },
];

// Components
function ServiceCard({ service }: { service: Service }) {
  return (
    <View className="m-2 w-[160px] overflow-hidden rounded-xl bg-white shadow-sm">
      <Image
        source={{ uri: service.imageUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348' }}
        className="h-32 w-full"
        contentFit="cover"
      />
      <View className="p-3">
        <Text className="font-semibold">{service.name}</Text>
        <Text className="text-sm text-gray-600">{service.description}</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-primary font-bold">${service.price}</Text>
          <Text className="text-xs text-gray-500">{service.duration} min</Text>
        </View>
      </View>
    </View>
  );
}

function StaffCard({ staff }: { staff: Staff }) {
  return (
    <View className="m-2 w-[140px] items-center">
      <Image
        source={{ uri: staff.image }}
        className="size-32 rounded-full"
        contentFit="cover"
      />
      <Text className="mt-2 font-semibold">{staff.name}</Text>
      <Text className="text-sm text-gray-600">{staff.role}</Text>
      <Text className="text-xs text-gray-500">
        {staff.experience} experience
      </Text>
    </View>
  );
}

// Create separate components for each section
function HeroSection() {
  const router = useRouter();

  return (
    <View className="relative h-[400px]">
      <Image
        source={require('../../../assets/images/nail_salon_services_category.jpg')}
        className="size-full"
        contentFit="cover"
      />
      <View className="absolute inset-0 bg-black/40" />
      <View className="absolute inset-0 items-center justify-center p-4">
        <Text className="text-center text-4xl font-bold text-white">
          Nail LyLy
        </Text>
        <Text className="mt-2 text-center text-lg text-white">
          Your Perfect Nail Experience Awaits
        </Text>
        <Button
          className="mt-4"
          onPress={() => {
            router.push('/scheduler/book-appointment');
          }}
        >
          <Text className="text-white">Book Now</Text>
        </Button>
      </View>
    </View>
  );
}

function AboutSection() {
  return (
    <View className="p-6">
      <Text className="text-2xl font-bold">About Us</Text>
      <Text className="mt-2 text-gray-600">
        Welcome to Nail LyLy, where beauty meets perfection. Our expert team
        provides top-quality nail services in a relaxing environment.
      </Text>
    </View>
  );
}

function ContactSection() {
  return (
    <View className="p-6">
      <Text className="mt-4 text-lg font-semibold">Contact Us</Text>
      <Text className="mt-1 text-gray-600">Phone: +1 (234) 567-890</Text>
      <Text className="mt-1 text-gray-600">Address: 123 Nail LyLy St, Beauty City</Text>
      <Text className="mt-1 text-gray-600">
        Facebook: <Text style={{ color: 'blue' }}>facebook.com/naillyly</Text>
      </Text>
      <Text className="mt-1 text-gray-600">Zalo: +1 (234) 567-890</Text>
    </View>
  );
}

function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      // console.log('Fetching services from API...');
      try {
        const response = await fetch('http://localhost:3000/api/services');
        // console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // console.log('Fetched services:', data);
        
        // Check if data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          // console.log('Data is an array and has items:', data);
          setServices(data);
        } else {
          console.warn('Fetched data is not an array or is empty:', data);
          // Set static services if fetched data is empty
          const staticServices = [
            {
              id: '1',
              name: 'Default Service',
              description: 'Classic manicure service',
              price: 30,
              duration: 60,
              imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
            },
            // Add more static services for testing
          ];
          setServices(staticServices);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <View className="p-4">
      <Text className="mb-4 text-2xl font-bold">Our Services</Text>
      {services.length === 0 ? ( // Check if services are empty
        <Text>No services available at the moment.</Text>
      ) : (
        <FlashList
          data={services}
          renderItem={({ item }) => <ServiceCard service={item} />}
          keyExtractor={(item) => item.id}
          horizontal
          estimatedItemSize={200}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function StaffSection() {
  return (
    <View className="p-4">
      <Text className="mb-4 text-2xl font-bold">Our Team</Text>
      <FlashList
        data={STAFF}
        renderItem={({ item }) => <StaffCard staff={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        estimatedItemSize={140}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

function CTASection() {
  const router = useRouter();
  return (
    <View className="bg-primary m-6 rounded-xl p-6">
      <Text className="text-center text-2xl font-bold text-white">
        Ready for Your Perfect Nails?
      </Text>
      <Text className="mt-2 text-center text-white">
        Book your appointment today and experience the difference
      </Text>
      <Button
        variant="secondary"
        className="mt-4"
        onPress={() => router.push('/scheduler/book-appointment')}
      >
        <Text className="text-white">Schedule Appointment</Text>
      </Button>
    </View>
  );
}

// Main component
export default function LandingPage() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <FocusAwareStatusBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <StaffSection />
        <ContactSection />
        <CTASection />
      </ScrollView>
    </SafeAreaView>
  );
}
