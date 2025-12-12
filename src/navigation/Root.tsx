import React from "react";
import { useAppInitializer } from "../store/AppInitializerContext";
import { useAuth } from "../api/auth/AuthProvider";
import LoginScreen from "../ui/screens/LoginScreen";
import AppStack from "./AppStack";
import LoadingView from "../ui/components/LoadingView";
import OnboardingScreen from "../ui/screens/OnboardingScreen";
import LanguageProvider from "../store/LanguageContext";

const Root = () => {
  const { user, isAuthenticated, loading: authLoading, login, authError } = useAuth();
  const { loading: initLoading } = useAppInitializer();

  if (!isAuthenticated) return <LoginScreen login={login} authError={authError} loading={authLoading}/>;

  if (authLoading || initLoading) return <LoadingView/>;

  if (!user.mainLang || !user.translationLang)
    return (
      <LanguageProvider>
        <OnboardingScreen/>
      </LanguageProvider>
    );

  return <AppStack/>;
};

export default Root;
