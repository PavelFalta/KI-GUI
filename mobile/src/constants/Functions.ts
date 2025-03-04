import { router } from 'expo-router';

export function navigate(route) {
  while (router.canGoBack()) {
    router.back();
  }
  router.replace(route);
}

export function navigateWithHistory(route) {
  router.navigate(route);
}
