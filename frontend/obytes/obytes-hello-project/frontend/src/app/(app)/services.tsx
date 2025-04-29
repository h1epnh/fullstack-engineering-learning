import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useAuth } from '@/lib/auth';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { fetchServices } from '@/api/services/services';

// Types
type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  services: string[];
};

function CategoryCard({ category }: { category: ServiceCategory }) {
  const router = useRouter();

  return (
    <View className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
      <Image
        source={{ uri: category.imageUrl }}
        className="h-48 w-full"
        contentFit="cover"
      />
      <View className="p-4">
        <Text className="text-xl font-bold">{category.name}</Text>
        <Text className="mt-1 text-gray-600">{category.description}</Text>
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

  const [services, setServices] = React.useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getToken } = useAuth();
  const loadServices = async () => {
    const token = getToken();
    try {
      const servicesData = await fetchServices(token);
      setServices(servicesData); // Assuming the API returns an array of appointments
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      // setLoading(false); // Set loading to false after the API call
    }
  };

  useEffect(() => {
    loadServices(); // Fetch appointments on component mount
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <Text className="mb-6 text-2xl font-bold">Our Services</Text>
          {services.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
