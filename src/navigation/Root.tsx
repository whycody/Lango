import React from 'react';

import { useAppUpdateCheck } from '../hooks';
import { useAppInitializer } from '../store/AppInitializerContext';
import { useAuth } from '../store/AuthContext';
import { LanguageProvider } from '../store/LanguageContext';
import { UserPreferencesProvider } from '../store/UserPreferencesContext';
import { LoadingView } from '../ui/containers/login';
import { LoginScreen } from '../ui/screens/LoginScreen';
import { OnboardingScreen } from '../ui/screens/OnboardingScreen';
import { UpdateAppScreen } from '../ui/screens/UpdateAppScreen';
import AppStack from './AppStack';

const Root = () => {
    const { authError, isAuthenticated, loading: authLoading, login, user } = useAuth();
    const { loading: initLoading } = useAppInitializer();
    const { checking, dismissAskLater, showUpdateScreen, updateRequired } = useAppUpdateCheck();

    if (checking) return <LoadingView />;

    if (showUpdateScreen) {
        return <UpdateAppScreen required={updateRequired} onAskLater={dismissAskLater} />;
    }

    if (!isAuthenticated) {
        return <LoginScreen authError={authError} loading={authLoading} login={login} />;
    }

    if (authLoading || initLoading) return <LoadingView />;

    if (!user?.mainLang || !user?.translationLang) {
        return (
            <UserPreferencesProvider>
                <LanguageProvider>
                    <OnboardingScreen />
                </LanguageProvider>
            </UserPreferencesProvider>
        );
    }

    return <AppStack />;
};

export default Root;
