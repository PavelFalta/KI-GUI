import { Stack } from 'expo-router';
import { screens } from '@/constants/Styles';

export default function RootLayout() {
  return (
    <Stack screenOptions={screens}>
      <Stack.Screen name="index" options={{ title: 'DocSchool' }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="courses" options={{ title: 'Courses' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Oops! Not Found' }} />
    </Stack>
  );
}
