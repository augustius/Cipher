import '../../global.css';

import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAppStore } from '@/store/app-store';
import colors from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    ...Feather.font,
  });

  const hasHydrated = useAppStore((state) => state.hasHydrated);

  const isReady = (fontsLoaded || fontError !== null) && hasHydrated;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.canvas },
        }}
      />
    </>
  );
}
