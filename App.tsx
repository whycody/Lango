import React, { useEffect, useState } from 'react';
import { StatusBar, SafeAreaView, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabsNavigator from './navigation/TabsNavigator';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from "./themes";
import WordsProvider from "./store/WordsContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FlashcardProvider } from "./store/FlashcardsContext";
import SessionScreen from "./screens/SessionScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatisticsProvider } from "./store/StatisticsContext";
import FlashcardsScreen from "./screens/FlashcardsScreen";
import { LanguageProvider } from "./store/LanguageContext";
import AuthProvider from "./auth/AuthProvider";

const Stack = createNativeStackNavigator();

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
    return <View style={{ flex: 1, backgroundColor: colors.card }}/>;
  }

  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor={colors.card}/>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
          <NavigationContainer theme={DarkTheme}>
            <StatisticsProvider>
              <LanguageProvider>
                <WordsProvider>
                  <FlashcardProvider>
                    <GestureHandlerRootView>
                      <BottomSheetModalProvider>
                        <AuthProvider>
                          <Stack.Navigator screenOptions={{ headerShown: false, navigationBarColor: colors.card }}>
                            <Stack.Screen name='Tabs' component={TabsNavigator}/>
                            <Stack.Screen name='Session' component={SessionScreen}/>
                            <Stack.Group screenOptions={{ presentation: "modal", animationDuration: 100 }}>
                              <Stack.Screen name='Flashcards' component={FlashcardsScreen}/>
                            </Stack.Group>
                          </Stack.Navigator>
                        </AuthProvider>
                      </BottomSheetModalProvider>
                    </GestureHandlerRootView>
                  </FlashcardProvider>
                </WordsProvider>
              </LanguageProvider>
            </StatisticsProvider>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}