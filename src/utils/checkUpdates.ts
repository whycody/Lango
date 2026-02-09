import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';

export async function checkUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await SplashScreen.preventAutoHideAsync()
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } finally {
    await SplashScreen.hideAsync()
  }
}