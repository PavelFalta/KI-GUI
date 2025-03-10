import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

export function navigate(route) {
  while (router.canGoBack()) {
    router.back();
  }
  router.replace(route);
}

export function navigateWithHistory(route) {
  router.navigate(route);
}

export const viewStyle = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFF',
  paddingHorizontal: 15,
};

export const noViewStyle = {
  flex: 1,
  backgroundColor: '#FFF',
};

export const scrollViewStyle = {
  alignItems: 'center',
  backgroundColor: '#FFF',
  paddingHorizontal: 15,
};
