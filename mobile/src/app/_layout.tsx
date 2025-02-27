import { Stack } from 'expo-router';
import { screens } from '@/constants/Theme';

export default function RootLayout() {
  return (
    <Stack screenOptions={screens}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
