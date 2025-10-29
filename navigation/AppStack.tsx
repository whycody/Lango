import FlashcardsScreen from "../screens/FlashcardsScreen";
import SessionScreen from "../screens/SessionScreen";
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
import { DarkTheme } from "../themes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

const Stack = createNativeStackNavigator();

const AppStack = () => {
  const { colors } = DarkTheme;
  const insets = useSafeAreaInsets();

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
                              <Stack.Screen
                                name='Tabs'
                                component={TabsNavigator}
                              />
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