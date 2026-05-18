import { StyleSheet, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
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
import { CustomTheme } from '../ui/Theme';
import { RootStackParamList, ScreenName } from './navigationTypes';
import TabsNavigator from './TabsNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppStackInner = () => {
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(insets.bottom);

    const screenOptions = {
        headerShown: false,
        navigationBarColor: colors.card,
        statusBarTranslucent: true,
    };

    const modalScreenOptions = {
        animationDuration: 100,
        contentStyle: { backgroundColor: colors.card },
        presentation: 'modal' as const,
    };

    return (
        <View style={styles.root}>
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
                                                    id="AppStackNavigator"
                                                    screenOptions={screenOptions}
                                                >
                                                    <Stack.Screen
                                                        component={TabsNavigator}
                                                        name={ScreenName.Tabs}
                                                    />
                                                    <Stack.Group screenOptions={modalScreenOptions}>
                                                        <Stack.Screen
                                                            component={SettingsScreen}
                                                            name={ScreenName.Settings}
                                                        />
                                                    </Stack.Group>
                                                    <Stack.Screen
                                                        component={SessionScreen}
                                                        name={ScreenName.Session}
                                                        options={{
                                                            navigationBarColor: colors.background,
                                                        }}
                                                    />
                                                    <Stack.Group screenOptions={modalScreenOptions}>
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
        </View>
    );
};

const AppStack = () => (
    <LanguageProvider>
        <UserPreferencesProvider>
            <AppStackInner />
        </UserPreferencesProvider>
    </LanguageProvider>
);

const getStyles = (bottomInset: number) =>
    StyleSheet.create({
        root: {
            flex: 1,
        },
    });

export default AppStack;
