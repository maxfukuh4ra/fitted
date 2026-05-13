import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  useFonts as useManropeFonts,
} from '@expo-google-fonts/manrope';
import {
  Newsreader_500Medium,
  useFonts as useNewsreaderFonts,
} from '@expo-google-fonts/newsreader';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [manropeLoaded] = useManropeFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
  });
  const [newsreaderLoaded] = useNewsreaderFonts({
    Newsreader_500Medium,
  });

  useEffect(() => {
    if (manropeLoaded && newsreaderLoaded) {
      SplashScreen.hideAsync();
    }
  }, [manropeLoaded, newsreaderLoaded]);

  if (!manropeLoaded || !newsreaderLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
