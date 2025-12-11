import FlashcardsScreen from "../ui/screens/FlashcardsScreen";
import SessionScreen, { SessionScreenParams } from "../ui/screens/SessionScreen";
import UserPreferencesProvider from "../store/UserPreferencesContext";
import LanguageProvider from "../store/LanguageContext";
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
import { useAuth } from "../api/auth/AuthProvider";
import OnboardingScreen from "../ui/screens/OnboardingScreen";

export type RootStackParamList = {
  Tabs: undefined;
  Onboarding: undefined;
  Settings: undefined;
  Session: SessionScreenParams;
  Flashcards: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => {
  const { colors } = DarkTheme;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={{ marginBottom: insets.bottom, flex: 1 }}>
      <UserPreferencesProvider>
        <LanguageProvider>
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
                              {(!user.mainLang || !user.translationLang) &&
                                <Stack.Screen
                                  name='Onboarding'
                                  component={OnboardingScreen}
                                />
                              }
                              <Stack.Screen
                                name='Tabs'
                                component={TabsNavigator}
                              />
                              <Stack.Group screenOptions={{
                                presentation: "modal",
                                animationDuration: 100,
                              }}>
                                <Stack.Screen
                                  name='Settings'
                                  component={SettingsScreen}
                                />
                              </Stack.Group>
                              <Stack.Screen
                                name='Session'
                                component={SessionScreen}
                              />
                              <Stack.Group screenOptions={{
                                presentation: "modal",
                                animationDuration: 100,
                              }}>
                                <Stack.Screen name='Flashcards' component={FlashcardsScreen}/>
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
        </LanguageProvider>
      </UserPreferencesProvider>
    </View>
  )
}

export default AppStack;