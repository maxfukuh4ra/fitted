import { Stack } from 'expo-router';
import { UploadProvider } from '@/contexts/UploadContext';

export default function UploadLayout() {
  return (
    <UploadProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="camera"
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack>
    </UploadProvider>
  );
}