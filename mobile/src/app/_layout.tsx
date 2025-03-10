import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{headerShadowVisible: false}}>
      <Stack.Screen name="index" options={{ title: 'Welcome', headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Sign in' }} />
      <Stack.Screen name="courses" options={{ title: 'Courses' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Oops! Not Found' }} />
      <Stack.Screen name="courseDetails" options={{ title: 'Course details' }} />
    </Stack>
  );
}
