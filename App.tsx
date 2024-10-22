import React from 'react';
import { StatusBar, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import TabsNavigator from './navigation/TabsNavigator';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import './i18n';
import { DarkTheme } from "./themes";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor='#0B0B27'/>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer theme={DarkTheme}>
          <Stack.Navigator>
            <Stack.Screen name='Tabs' component={TabsNavigator} options={{ headerShown: false, }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
}