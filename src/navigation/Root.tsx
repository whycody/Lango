import React from 'react';

import { LanguageProvider, useAppInitializer, useAuth } from '../store';
import { LoadingView } from '../ui/containers/login';
import { LoginScreen, OnboardingScreen } from '../ui/screens';
import AppStack from './AppStack';

const Root = () => {
    const { authError, isAuthenticated, loading: authLoading, login, user } = useAuth();
    const { loading: initLoading } = useAppInitializer();

    if (!isAuthenticated)
        return <LoginScreen authError={authError} loading={authLoading} login={login} />;

    if (authLoading || initLoading) return <LoadingView />;

    if (!user.mainLang || !user.translationLang)
        return (
            <LanguageProvider>
                <OnboardingScreen />
            </LanguageProvider>
        );

    return <AppStack />;
};

export default Root;
