import React, { useEffect, useState } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from "./src/ui/themes";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "./src/api/auth/AuthProvider";
import Root from "./src/navigation/Root";
import AppInitializerProvider from "./src/store/AppInitializerContext";
import { UserStorageProvider } from "./src/store/UserStorageContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { checkUpdates } from "./src/utils/checkUpdates";
import { useTypedMMKV } from "./src/hooks/useTypedMKKV";
import { LanguageCode } from "./src/constants/LanguageCode";
import { APPLICATION_LANG } from "./src/store/LanguageContext";
import { useTranslation } from "react-i18next";
import { useMMKV } from "react-native-mmkv";

export default function App() {
  const { i18n } = useTranslation();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [applicationLang] = useTypedMMKV<LanguageCode>(APPLICATION_LANG, i18n.language as LanguageCode, useMMKV());
  const { colors } = DarkTheme;

  useEffect(() => {
    if (!applicationLang) return;
    i18n.changeLanguage(applicationLang);
  }, [applicationLang]);

  checkUpdates();

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
      <StatusBar barStyle="light-content" translucent backgroundColor={'transparent'}/>
      <SafeAreaProvider style={{ backgroundColor: colors.card }}>
        <GestureHandlerRootView>
          <NavigationContainer theme={DarkTheme}>
            <AuthProvider>
              <UserStorageProvider>
                <AppInitializerProvider>
                  <KeyboardProvider>
                    <Root/>
                  </KeyboardProvider>
                </AppInitializerProvider>
              </UserStorageProvider>
            </AuthProvider>
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </>
  );
}