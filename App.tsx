import React, { useEffect, useState } from 'react';
import { StatusBar, SafeAreaView, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from "./themes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AuthProvider from "./api/auth/AuthProvider";
import Root from "./navigation/Root";
import AppInitializerProvider from "./store/AppInitializerContext";
import { UserStorageProvider } from "./store/UserStorageContext";

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
      <StatusBar barStyle='light-content' backgroundColor={colors.background}/>
      <GestureHandlerRootView>
        <SafeAreaProvider style={{ backgroundColor: colors.background }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <NavigationContainer theme={DarkTheme}>
              <AuthProvider>
                <UserStorageProvider>
                  <AppInitializerProvider>
                    <Root/>
                  </AppInitializerProvider>
                </UserStorageProvider>
              </AuthProvider>
            </NavigationContainer>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </>
  );
}