import React from 'react';

import { useAppInitializer } from '../store/AppInitializerContext';
import { useAuth } from '../store/AuthContext';
import { LanguageProvider } from '../store/LanguageContext';
import { LoadingView } from '../ui/containers/login';
import { LoginScreen } from '../ui/screens/LoginScreen';
import { OnboardingScreen } from '../ui/screens/OnboardingScreen';
import AppStack from './AppStack';

const Root = () => {
    const { authError, isAuthenticated, loading: authLoading, login, user } = useAuth();
    const { loading: initLoading } = useAppInitializer();

    if (!isAuthenticated)
        return <LoginScreen authError={authError} loading={authLoading} login={login} />;

    if (authLoading || initLoading) return <LoadingView />;

    if (!user?.mainLang || !user?.translationLang) {
        return (
            <LanguageProvider>
                <OnboardingScreen />
            </LanguageProvider>
        );
    }

    return <AppStack />;
};

export default Root;
