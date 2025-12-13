import { BackHandler, FlatList, Linking, ScrollView, View } from "react-native";
import ProfileCard from "../cards/library/ProfileCard";
import { useTranslation } from "react-i18next";
import LibraryItem from "../components/items/LibraryItem";
import { useNavigation } from "@react-navigation/native";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useEffect, useRef, useState } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useWords } from "../../store/WordsContext";
import { LibraryNavProp, Word } from "../../types";
import { useLanguage } from "../../store/LanguageContext";
import { useAuth } from "../../api/auth/AuthProvider";
import { useDynamicStatusBar } from "../../hooks/useDynamicStatusBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LibraryItems } from "../../constants/LibraryItems";

const LibraryScreen = () => {
  const { t } = useTranslation();
  const { langWords } = useWords();
  const navigation = useNavigation<LibraryNavProp>();
  const langContext = useLanguage();
  const languageBottomSheetRef = useRef<BottomSheetModal>()
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const { style, onScroll } = useDynamicStatusBar(100, 0.3);
  const insets = useSafeAreaInsets();
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

  const currentLang = langContext.languages.filter(lang => lang.languageCode === langContext.mainLang)[0].languageName;

  const getMyWordsDesc = () => {
    const langWordsCount = langWords.filter((w) => !w.removed).length;
    switch (langWordsCount) {
      case 0:
        return t('words_desc_empty');
      case 1:
        return t('words_desc_s');
      default:
        return t('words_desc', { words_number: `${langWordsCount}` });
    }
  }

  const libraryItems = [
    {
      id: LibraryItems.SETTINGS,
      label: t('settings'),
      description: t('settings_desc'),
      icon: 'settings-sharp'
    },
    {
      id: LibraryItems.LANGUAGE,
      label: t('main_language'),
      description: currentLang,
      icon: 'language-sharp'
    },
    {
      id: LibraryItems.MY_WORDS,
      label: t('myWords'),
      description: getMyWordsDesc(),
      icon: 'albums-sharp'
    },
    {
      id: LibraryItems.LOGOUT,
      label: t('logout'),
      description: t('logout_desc'),
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
        navigation.navigate('Flashcards');
        break;
      case LibraryItems.LANGUAGE:
        languageBottomSheetRef.current?.present();
        break;
      case LibraryItems.LOGOUT:
        authContext.logout();
        break;
      case LibraryItems.PRIVACY_POLICY:
        Linking.openURL(`${process.env['SITE_URL']}/privacy_policy`);
        break;
      case LibraryItems.USE_CONDITIONS:
        Linking.openURL(`${process.env['SITE_URL']}/terms_of_service`);
        break;
      case LibraryItems.SETTINGS:
        navigation.navigate('Settings');
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
    <>
      <View style={style}/>
      <ScrollView showsHorizontalScrollIndicator={false} onScroll={onScroll}>
        <LanguageBottomSheet
          ref={languageBottomSheetRef}
          onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
        />
        <View style={{ height: insets.top }}/>
        <ProfileCard/>
        <FlatList
          scrollEnabled={false}
          data={libraryItems}
          renderItem={renderLibraryItem}
        />
      </ScrollView>
    </>
  );
}

export default LibraryScreen;