import { Stack } from 'expo-router';

export default function UploadLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="camera"
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack>
  );
}