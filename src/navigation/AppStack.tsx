import FlashcardsScreen from "../ui/screens/FlashcardsScreen";
import SessionScreen, { SessionScreenParams } from "../ui/screens/SessionScreen";
import UserPreferencesProvider from "../store/UserPreferencesContext";
import SessionsProvider from "../store/SessionsContext";
import SuggestionsProvider from "../store/SuggestionsContext";
import StatisticsProvider from "../store/StatisticsContext";
import WordsProvider from "../store/WordsContext";
import EvaluationsProvider from "../store/EvaluationsContext";
import WordsMLStatesProvider from "../store/WordsMLStatesContext";
import { WordsHeuristicProvider } from "../store/WordsHeuristicStatesContext";
import WordsWithDetailsProvider from "../store/WordsWithDetailsContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import TabsNavigator from "./TabsNavigator";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DarkTheme } from "../ui/themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import SettingsScreen from "../ui/screens/SettingsScreen";
import LanguageProvider from "../store/LanguageContext";

export type RootStackParamList = {
  Tabs: undefined;
  Settings: undefined;
  Session: SessionScreenParams;
  Flashcards: undefined;
};

export enum ScreenName {
  Tabs = 'Tabs',
  Settings = 'Settings',
  Session = 'Session',
  Flashcards = 'Flashcards',
}

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => {
  const { colors } = DarkTheme;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ marginBottom: insets.bottom, flex: 1 }}>
      <LanguageProvider>
        <UserPreferencesProvider>
          <SessionsProvider>
            <SuggestionsProvider>
              <StatisticsProvider>
                <WordsProvider>
                  <EvaluationsProvider>
                    <WordsMLStatesProvider>
                      <WordsHeuristicProvider>
                        <WordsWithDetailsProvider>
                          <BottomSheetModalProvider>
                            <Stack.Navigator
                              screenOptions={{
                                headerShown: false,
                                navigationBarColor: colors.card,
                                statusBarTranslucent: true,
                              }}>
                              <Stack.Screen
                                name={ScreenName.Tabs}
                                component={TabsNavigator}
                              />
                              <Stack.Group screenOptions={{
                                presentation: "modal",
                                animationDuration: 100,
                              }}>
                                <Stack.Screen
                                  name={ScreenName.Settings}
                                  component={SettingsScreen}
                                />
                              </Stack.Group>
                              <Stack.Screen
                                name={ScreenName.Session}
                                component={SessionScreen}
                              />
                              <Stack.Group screenOptions={{
                                presentation: "modal",
                                animationDuration: 100,
                              }}>
                                <Stack.Screen name={ScreenName.Flashcards} component={FlashcardsScreen}/>
                              </Stack.Group>
                            </Stack.Navigator>
                          </BottomSheetModalProvider>
                        </WordsWithDetailsProvider>
                      </WordsHeuristicProvider>
                    </WordsMLStatesProvider>
                  </EvaluationsProvider>
                </WordsProvider>
              </StatisticsProvider>
            </SuggestionsProvider>
          </SessionsProvider>
        </UserPreferencesProvider>
      </LanguageProvider>
    </View>
  )
}

export default AppStack;