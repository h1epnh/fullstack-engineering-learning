import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';

// Types
type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  services: string[];
};

// Mock data
const CATEGORIES: ServiceCategory[] = [
  {
    id: '1',
    name: 'Manicure',
    description: 'Classic and modern nail care treatments',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', // Manicure in progress
    services: [
      'Classic Manicure',
      'Gel Manicure',
      'French Manicure',
      'Nail Art',
    ],
  },
  {
    id: '2',
    name: 'Pedicure',
    description: 'Luxurious foot care and treatments',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df', // Pedicure treatment
    services: [
      'Classic Pedicure',
      'Spa Pedicure',
      'Gel Pedicure',
      'Medical Pedicure',
    ],
  },
  {
    id: '3',
    name: 'Nail Extensions',
    description: 'Professional nail enhancement services',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371', // Acrylic nails
    services: [
      'Acrylic Nails',
      'Gel Extensions',
      'Dip Powder',
      'Press-on Nails',
    ],
  },
  {
    id: '4',
    name: 'Nail Art',
    description: 'Creative and custom nail designs',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371', // Artistic nail design
    services: ['Hand-painted Art', '3D Nail Art', 'Stamping', 'Ombre/Gradient'],
  },
  {
    id: '5',
    name: 'Special Treatments',
    description: 'Premium nail care solutions',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348', // Spa treatment
    services: [
      'Paraffin Treatment',
      'Nail Repair',
      'Cuticle Care',
      'Nail Strengthening',
    ],
  },
];

function CategoryCard({ category }: { category: ServiceCategory }) {
  const router = useRouter();

  return (
    <View className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
      <Image
        source={{ uri: category.image }}
        className="h-48 w-full"
        contentFit="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold">{category.name}</Text>
        <Text className="mt-1 text-gray-600">{category.description}</Text>
        <View className="mt-3">
          {category.services.map((service, index) => (
            <View key={index} className="mb-2 flex-row items-center">
              <View className="bg-primary mr-2 size-1.5 rounded-full" />
              <Text className="text-gray-700">{service}</Text>
            </View>
          ))}
        </View>
        <Button
          className="mt-4"
          onPress={() => router.push(`/services/${category.id}`)}
        >
          <Text className="text-white">View Details</Text>
        </Button>
      </View>
    </View>
  );
}

export default function Services() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="mb-6 text-2xl font-bold">Our Services</Text>
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
