import { StyleSheet, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EvaluationsProvider } from '../store/EvaluationsContext';
import { LanguageProvider } from '../store/LanguageContext';
import { SessionsProvider } from '../store/SessionsContext';
import { StatisticsProvider } from '../store/StatisticsContext';
import { SuggestionsProvider } from '../store/SuggestionsContext';
import { UserPreferencesProvider } from '../store/UserPreferencesContext';
import { WordsProvider } from '../store/WordsContext';
import { WordsHeuristicProvider } from '../store/WordsHeuristicStatesContext';
import { WordsMLStatesProvider } from '../store/WordsMLStatesContext';
import { WordsWithDetailsProvider } from '../store/WordsWithDetailsContext';
import { FlashcardsScreen } from '../ui/screens/FlashcardsScreen';
import { SessionScreen } from '../ui/screens/SessionScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { DarkTheme } from '../ui/themes';
import { RootStackParamList, ScreenName } from './navigationTypes';
import TabsNavigator from './TabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStack = () => {
    const { colors } = DarkTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(insets.bottom);

    return (
        <View style={styles.root}>
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
                                                            }}
                                                        >
                                                            <Stack.Screen
                                                                component={TabsNavigator}
                                                                name={ScreenName.Tabs}
                                                            />
                                                            <Stack.Group
                                                                screenOptions={{
                                                                    animationDuration: 100,
                                                                    presentation: 'modal',
                                                                }}
                                                            >
                                                                <Stack.Screen
                                                                    component={SettingsScreen}
                                                                    name={ScreenName.Settings}
                                                                />
                                                            </Stack.Group>
                                                            <Stack.Screen
                                                                component={SessionScreen}
                                                                name={ScreenName.Session}
                                                            />
                                                            <Stack.Group
                                                                screenOptions={{
                                                                    animationDuration: 100,
                                                                    presentation: 'modal',
                                                                }}
                                                            >
                                                                <Stack.Screen
                                                                    component={FlashcardsScreen}
                                                                    name={ScreenName.Flashcards}
                                                                />
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
    );
};

const getStyles = (bottomInset: number) =>
    StyleSheet.create({
        root: {
            flex: 1,
            marginBottom: bottomInset,
        },
    });

export default AppStack;
