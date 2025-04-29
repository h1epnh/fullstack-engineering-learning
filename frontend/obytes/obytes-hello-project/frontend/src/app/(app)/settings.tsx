/* eslint-disable react/react-in-jsx-scope */
import { Env } from '@env';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { Image } from 'expo-image';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { translate, useAuth } from '@/lib';
import { jwtDecode } from 'jwt-decode';
import { Linking } from 'react-native';
import { Facebook } from '@/components/ui/icons/facebook';
import { Instagram } from '@/components/ui/icons/instagram';
import { Zalo } from '@/components/ui/icons/zalo';
// const { getToken } = useAuth();


export default function Settings() {
  const signOut = useAuth.use.signOut();
  const getToken = useAuth.use.getToken();
  
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  const [user, setUser] = useState(null); 

  useEffect(() => {
    console.log('useEffect');
    const getTokenOnce = async () => {
      try {
        if (getToken() !== null) {
          const userToken = getToken();
          const decodedToken = jwtDecode(userToken?.access || '');

          setUser(decodedToken);
        }
      } catch (e) {
        // catch error here
        console.log(e);
      }
    };
    
    getTokenOnce();
  }, []);

  return (
    
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 px-4 pt-16 ">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>

          <View className="mt-4 mb-6 flex-row items-center p-4 bg-white rounded-xl shadow-sm">
            <Image
              source={'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}
              className="w-16 h-16 rounded-full"
              contentFit="cover"
            />
            <View className="ml-4">
              <Text className="text-lg font-semibold">
                <Text className="text-blue-500">Hi</Text> {user?.name || 'Guest'}
              </Text>
              <Text className="text-sm text-gray-500">{user?.email || 'guest@example.com'}</Text>
              <Text className="text-sm text-gray-500">{user?.phone || '+84 909 090 909'}</Text>
            </View>
          </View>

          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <ItemsContainer title="settings.support_us">
            <Item
              text="settings.share"
              icon={<Share color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.rate"
              icon={<Rate color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.support"
              icon={<Support color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          <ItemsContainer title="settings.links">
            <Item text="settings.privacy" onPress={() => {
              Linking.openURL('https://changtraisitinh.github.io/app-privacy-policy.html')
            }} />
            <Item text="settings.terms" onPress={() => {}} />
            <Item
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.zalo"
              icon={<Zalo color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.facebook"
              icon={<Facebook color={iconColor} />}
              onPress={() => {}}
            />
            <Item
              text="settings.instagram"
              icon={<Instagram color={iconColor} />}
              onPress={() => {}}
            />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={signOut} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
