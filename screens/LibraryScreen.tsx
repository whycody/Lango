import { BackHandler, FlatList, Platform, Image, ScrollView } from "react-native";
import ProfileCard from "../cards/library/ProfileCard";
import { useTranslation } from "react-i18next";
import LibraryItem from "../components/LibraryItem";
import { useNavigation, useTheme } from "@react-navigation/native";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLanguage } from "../hooks/useLanguage";
import { useWords } from "../store/WordsContext";
import { exportData } from "../utils/saveData";
import CustomText from "../components/CustomText";
import appBuildNumbers from "../app.json";
import { useAuth } from "../hooks/useAuth";
import { useEvaluations } from "../store/EvaluationsContext";
import { Word } from "../store/types";

const LibraryScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const words = useWords();
  const evaluations = useEvaluations();
  const navigation = useNavigation();
  const langContext = useLanguage();
  const languageBottomSheetRef = useRef<BottomSheetModal>()
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const buildNumber = Platform.OS === 'ios' ? appBuildNumbers.expo.ios.buildNumber : appBuildNumbers.expo.android.versionCode;
  const runtimeVersion = appBuildNumbers.expo.runtimeVersion;
  const authContext = useAuth();

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        languageBottomSheetRef.current?.dismiss();
        return true;
      }
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  enum LibraryItems {
    SETTINGS,
    LANGUAGE,
    MY_WORDS,
    LOGOUT,
    EXPORT,
    PRIVACY_POLICY,
    USE_CONDITIONS
  }

  const currentLang = langContext.languages.filter(lang => lang.languageCode === langContext.studyingLangCode)[0].languageName;

  const libraryItems = [
    {
      id: LibraryItems.SETTINGS,
      label: t('settings'),
      description: t('settings_desc'),
      icon: 'settings-sharp'
    },
    {
      id: LibraryItems.LANGUAGE,
      label: t('language'),
      description: currentLang,
      icon: 'language-sharp'
    },
    {
      id: LibraryItems.MY_WORDS,
      label: t('myWords'),
      description: t('words_desc', { words_number: words.words.filter((word: Word) => !word.removed).length.toString() }),
      icon: 'albums-sharp'
    },
    {
      id: LibraryItems.EXPORT,
      label: t('export'),
      description: t('export_desc', { records_number: evaluations.evaluations.length.toString() }),
      icon: 'share-outline'
    },
    {
      id: LibraryItems.LOGOUT,
      label: t('logout'),
      icon: 'log-out-sharp'
    },
    {
      id: LibraryItems.PRIVACY_POLICY,
      label: t('privacyPolicy')
    },
    {
      id: LibraryItems.USE_CONDITIONS,
      label: t('useConditions')
    },
  ]

  const handlePress = (id: number) => {
    switch (id) {
      case LibraryItems.MY_WORDS:
        navigation.navigate('Flashcards' as never);
        break;
      case LibraryItems.EXPORT:
        exportData();
        break;
      case LibraryItems.LANGUAGE:
        languageBottomSheetRef.current?.present();
        break;
      case LibraryItems.LOGOUT:
        authContext.logout();
        break;
      default:
        break;
    }
  }

  const renderLibraryItem = ({ item, index }) => (
    <LibraryItem
      key={item.id}
      label={item.label}
      icon={item.icon}
      description={item.description}
      index={index}
      onPress={() => handlePress(item.id)}
    />
  );

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      <LanguageBottomSheet
        ref={languageBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <ProfileCard/>
      <FlatList
        scrollEnabled={false}
        data={libraryItems}
        renderItem={renderLibraryItem}
        ListFooterComponent={() => (
          <>
            <Image
              source={require('../assets/logo.png')}
              style={{
                height: 40,
                alignSelf: 'center',
                marginTop: 30,
              }}
              resizeMode="contain"
            />
            <CustomText
              style={{ color: colors.text, marginTop: 5, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', fontSize: 12 }}>
              {`${runtimeVersion}.${buildNumber}`}
            </CustomText>
          </>
        )}
      />
    </ScrollView>
  );
}

export default LibraryScreen;