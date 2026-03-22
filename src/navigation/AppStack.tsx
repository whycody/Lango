import { StyleSheet, View } from 'react-native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    EvaluationsProvider,
    LanguageProvider,
    SessionsProvider,
    StatisticsProvider,
    SuggestionsProvider,
    UserPreferencesProvider,
    WordsHeuristicProvider,
    WordsMLStatesProvider,
    WordsProvider,
    WordsWithDetailsProvider,
} from '../store';
import {
    FlashcardsScreen,
    SessionScreen,
    SessionScreenParams,
    SettingsScreen,
} from '../ui/screens';
import { DarkTheme } from '../ui/themes';
import TabsNavigator from './TabsNavigator';

export type RootStackParamList = {
    Flashcards: undefined;
    Session: SessionScreenParams;
    Settings: undefined;
    Tabs: undefined;
};

export enum ScreenName {
    Flashcards = 'Flashcards',
    Session = 'Session',
    Settings = 'Settings',
    Tabs = 'Tabs',
}

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
