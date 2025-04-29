import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

// Types
type ServiceDetail = {
  id: string;
  name: string;
  description: string;
  image: string;
  services: {
    name: string;
    price: number;
    duration: string;
    description: string;
  }[];
  benefits: string[];
  aftercare: string[];
};


// Types
type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  duration: string;
  benefits: string[];
  aftercare: string[];
  createdAt: string;
  updatedAt: string;
};

function ServiceItem({ service }: { service: ServiceDetail['services'][0] }) {
  const router = useRouter();

  return (
    <View className="mb-4 rounded-lg bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold">{service.name}</Text>
        <Text className="text-primary font-bold">${service.price}</Text>
      </View>
      <Text className="mt-1 text-sm text-gray-600">{service.description}</Text>
      <Text className="mt-2 text-sm text-gray-500">{service.duration}</Text>
      <Button
        className="mt-3"
        onPress={() => router.push(`/book-appointment?service=${service.name}`)}
      >
        <Text className="text-white">Book Now</Text>
      </Button>
    </View>
  );
}

function AftercareTips({ tips }: { tips: string[] }) {
  return (
    <>
      <Text className="mb-4 mt-6 text-xl font-bold">Aftercare Tips</Text>
      <View className="rounded-lg bg-white p-4 shadow-sm">
        {tips.map((tip, index) => (
          <View key={index} className="mb-2 flex-row items-center">
            <View className="bg-primary mr-2 size-1.5 rounded-full" />
            <Text className="text-gray-700">{tip}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  console.log('ServiceDetail ', id);

  const [service, setService] = React.useState<Service>();
  const { getToken } = useAuth();
  const fetchServicesById = async () => {
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:3000/api/services/${id}`, {
        headers: {
          'Authorization': `Bearer ${token?.access}`,
        },
        });
        
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      console.log(data);
      setService(data); // Assuming the API returns an array of appointments
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      // setLoading(false); // Set loading to false after the API call
    }
  };

  useEffect(() => {
    fetchServicesById(); // Fetch appointments on component mount
  }, []);

  if (!service) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">Service not found</Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <Text className="text-white">Go Back</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (

    <SafeAreaView className="flex-1 bg-gray-50">
      <FocusAwareStatusBar />
      <ScrollView>
        {/* Hero Image */}
        <View className="relative h-64">
          <Image
            source={{ uri: service?.imageUrl || '' }}
            className="size-full"
            contentFit="cover"
          />
          <View className="absolute inset-0 bg-black/30" />
          <View className="absolute inset-0 items-center justify-center p-4">
            <Text className="text-center text-3xl font-bold text-white">
              {service?.name || ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="p-4">
          {/* Description */}
          <Text className="mb-6 text-gray-600">{service?.description || ''}</Text>

          {/* Services */}
          <Text className="mb-4 text-xl font-bold">Available Services</Text>
          <ServiceItem key={1} service={service} />
          {/* {service.services.map((item, index) => (
            <ServiceItem key={index} service={item} />
          ))} */}

          {/* Benefits */}
          <Text className="mb-4 mt-6 text-xl font-bold">Benefits</Text>
          <View className="rounded-lg bg-white p-4 shadow-sm">
          <View key={1} className="mb-2 flex-row items-center">
                <View className="bg-primary mr-2 size-1.5 rounded-full" />
                  <Text className="text-gray-700">{'Sale off to 30% for new customers'}</Text>
                </View>
            </View>
            {/* {service.benefits.map((benefit, index) => (
              <View key={index} className="mb-2 flex-row items-center">
                <View className="bg-primary mr-2 size-1.5 rounded-full" />
                <Text className="text-gray-700">{benefit}</Text>
              </View>
            ))} */}

          <AftercareTips tips={[service.description]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
