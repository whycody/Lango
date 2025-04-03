import { BackHandler, FlatList, Text, ScrollView } from "react-native";
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

const LibraryScreen = () => {
  const { t } = useTranslation();
  const words = useWords();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const langContext = useLanguage();
  const languageBottomSheetRef = useRef<BottomSheetModal>()
  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

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
    PRIVACY_POLICY,
    USE_CONDITIONS
  }

  const currentLang = langContext.languages.filter(lang => lang.languageCode === langContext.studyingLangCode)[0].languageName;

  const libraryItems = [
    { id: LibraryItems.SETTINGS, label: t('settings'), icon: 'settings-sharp' },
    { id: LibraryItems.LANGUAGE, label: t('language'), description: currentLang, icon: 'language-sharp' },
    { id: LibraryItems.MY_WORDS, label: t('myWords'), icon: 'albums-sharp' },
    { id: LibraryItems.LOGOUT, label: t('logout'), icon: 'log-out-sharp' },
    { id: LibraryItems.PRIVACY_POLICY, label: t('privacyPolicy') },
    { id: LibraryItems.USE_CONDITIONS, label: t('useConditions') },
  ]

  const handlePress = (id: number) => {
    switch (id) {
      case LibraryItems.MY_WORDS:
        navigation.navigate('Flashcards' as never);
        break;
      case LibraryItems.LANGUAGE:
        languageBottomSheetRef.current?.present();
        break;
      default:
        break;
    }
  }

  const renderLibraryItem = ({ item, index }) => (
    <LibraryItem key={item.id} label={item.label} icon={item.icon} description={item.description} index={index}
                 onPress={() => handlePress(item.id)}/>
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
        ListFooterComponent={
          <Text
            style={{ color: colors.primary600, opacity: 1, textAlign: 'center', fontSize: 12, marginTop: 16 }}
            onPress={exportData}
          >
            {words.evaluationsNumber}
          </Text>
        }
      />
    </ScrollView>
  );
}

export default LibraryScreen;