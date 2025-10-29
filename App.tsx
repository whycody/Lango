import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from "./themes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "./api/auth/AuthProvider";
import Root from "./navigation/Root";
import AppInitializerProvider from "./store/AppInitializerContext";
import { UserStorageProvider } from "./store/UserStorageContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { colors } = DarkTheme;

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Montserrat-Regular': require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
        'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
        'Montserrat-Black': require('./assets/fonts/Montserrat-Black.ttf'),
      });
      setFontsLoaded(true);
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }}/>;
  }

  return (
    <>
      <SafeAreaProvider style={{ backgroundColor: colors.background }}>
        <GestureHandlerRootView>
          <NavigationContainer theme={DarkTheme}>
            <AuthProvider>
              <UserStorageProvider>
                <AppInitializerProvider>
                  <Root/>
                </AppInitializerProvider>
              </UserStorageProvider>
            </AuthProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}