import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';
import { Button } from '@/components/ui/button';

// Types
type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
};

type Staff = {
  id: string;
  name: string;
  role: string;
  image: string;
  experience: string;
};

// Mock data
const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Classic Manicure',
    description: 'Basic nail care with polish',
    price: 25,
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },
  {
    id: '2',
    name: 'Gel Manicure',
    description: 'Long-lasting gel polish application',
    price: 35,
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },
  {
    id: '3',
    name: 'Acrylic Nails',
    description: 'Full set of acrylic nails',
    price: 45,
    duration: '90 min',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },
  {
    id: '4',
    name: 'Nail Art',
    description: 'Custom nail designs',
    price: 15,
    duration: '30 min',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },
  {
    id: '5',
    name: 'Pedicure',
    description: 'Foot care and polish',
    price: 30,
    duration: '60 min',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
  },
];

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
        source={{ uri: service.image }}
        className="h-32 w-full"
        contentFit="cover"
      />
      <View className="p-3">
        <Text className="font-semibold">{service.name}</Text>
        <Text className="text-sm text-gray-600">{service.description}</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-primary font-bold">${service.price}</Text>
          <Text className="text-xs text-gray-500">{service.duration}</Text>
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
        source={{
          uri: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
        }}
        className="size-full"
        contentFit="cover"
      />
      <View className="absolute inset-0 bg-black/40" />
      <View className="absolute inset-0 items-center justify-center p-4">
        <Text className="text-center text-4xl font-bold text-white">
          Nail Haven
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
        Welcome to Nail Haven, where beauty meets perfection. Our expert team
        provides top-quality nail services in a relaxing environment.
      </Text>
    </View>
  );
}
function ServicesSection() {
  return (
    <View className="p-4">
      <Text className="mb-4 text-2xl font-bold">Our Services</Text>
      <FlashList
        data={SERVICES}
        renderItem={({ item }) => <ServiceCard service={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        estimatedItemSize={200}
        showsHorizontalScrollIndicator={false}
      />
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
        <CTASection />
      </ScrollView>
    </SafeAreaView>
  );
}
