import { Stack } from 'expo-router';
import { header } from '@/constants/Styles';

export default function RootLayout() {
  return (
    <Stack screenOptions={header}>
      <Stack.Screen name="index" options={{ title: 'DocSchool' }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="courses" options={{ title: 'Courses' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Oops! Not Found' }} />
      <Stack.Screen name="specific-course" options={{ title: 'Course details' }} />
    </Stack>
  );
}
