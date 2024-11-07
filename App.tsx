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
    return <View/>;
  }

  return (
    <WordsProvider>
      <StatusBar barStyle='light-content' backgroundColor={colors.card}/>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
        <NavigationContainer theme={DarkTheme}>
          <FlashcardProvider>
            <GestureHandlerRootView>
              <BottomSheetModalProvider>
                <Stack.Navigator>
                  <Stack.Screen name='Tabs' component={TabsNavigator} options={{ headerShown: false, }}/>
                  <Stack.Screen name='Session' component={SessionScreen} options={{ headerShown: false, }}/>
                </Stack.Navigator>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </FlashcardProvider>
        </NavigationContainer>
      </SafeAreaView>
    </WordsProvider>
  );
}