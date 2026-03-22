import React, { useEffect, useState } from 'react';
import { AppState, StatusBar, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import './i18n';
import * as Font from 'expo-font';
import { DarkTheme } from './src/ui/themes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthProvider from './src/store/AuthContext';
import Root from './src/navigation/Root';
import { AppInitializerProvider, APPLICATION_LANG, UserStorageProvider } from './src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { checkUpdates } from './src/utils/checkUpdates';
import { useTypedMMKV } from './src/hooks';
import { useTranslation } from 'react-i18next';
import { useMMKV } from 'react-native-mmkv';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { LanguageCode } from './src/constants/Language';

SplashScreen.preventAutoHideAsync();

export default function App() {
    const { i18n } = useTranslation();
    const [fontsLoaded, setFontsLoaded] = useState(false);
    const [applicationLang] = useTypedMMKV<LanguageCode>(
        APPLICATION_LANG,
        i18n.language as LanguageCode,
        useMMKV(),
    );
    const { colors } = DarkTheme;
    const styles = getStyles(colors);

    useEffect(() => {
        if (!applicationLang) return;
        i18n.changeLanguage(applicationLang);
    }, [applicationLang]);

    const checkForUpdates = async () => {
        await checkUpdates();
        await SplashScreen.hideAsync();
    };

    checkForUpdates();

    AppState.addEventListener('change', state => {
        if (state === 'active') {
            Notifications.dismissAllNotificationsAsync();
        }
    });

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
        return <View style={styles.emptyView} />;
    }

    return (
        <>
            <StatusBar barStyle="light-content" translucent backgroundColor={'transparent'} />
            <SafeAreaProvider style={styles.root}>
                <GestureHandlerRootView>
                    <NavigationContainer theme={DarkTheme}>
                        <AuthProvider>
                            <UserStorageProvider>
                                <AppInitializerProvider>
                                    <KeyboardProvider>
                                        <Root />
                                    </KeyboardProvider>
                                </AppInitializerProvider>
                            </UserStorageProvider>
                        </AuthProvider>
                    </NavigationContainer>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </>
    );
}

const getStyles = (colors: any) =>
    StyleSheet.create({
        emptyView: {
            flex: 1,
            backgroundColor: colors.background,
        },
        root: { backgroundColor: colors.card },
    });
