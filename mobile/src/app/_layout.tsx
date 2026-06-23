import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { C } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.cream } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="questions" />
          <Stack.Screen name="paywall" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="camera" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="ingredients" />
          <Stack.Screen name="suggestions" />
          <Stack.Screen name="recipe/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="cooking/[id]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="delete-account" />
          <Stack.Screen name="edit-profile" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
