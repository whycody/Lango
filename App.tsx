import React, { useEffect, useState } from 'react';
import { StatusBar, SafeAreaView, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabsNavigator from './navigation/TabsNavigator';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from "./themes";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

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
    <>
      <StatusBar barStyle='light-content' backgroundColor='#0B0B27'/>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator>
            <Stack.Screen name='Tabs' component={TabsNavigator} options={{ headerShown: false, }}/>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}