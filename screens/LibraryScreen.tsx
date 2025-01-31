import { FlatList, ScrollView } from "react-native";
import ProfileCard from "../cards/library/ProfileCard";
import { useTranslation } from "react-i18next";
import LibraryItem from "../components/LibraryItem";
import { useNavigation } from "@react-navigation/native";
import LanguageBottomSheet from "../sheets/LanguageBottomSheet";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const LibraryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const languageBottomSheetRef = useRef<BottomSheetModal>()

  enum LibraryItems {
    SETTINGS,
    LANGUAGE,
    MY_WORDS,
    LOGOUT,
    PRIVACY_POLICY,
    USE_CONDITIONS
  }

  const libraryItems = [
    { id: LibraryItems.SETTINGS, label: t('settings'), icon: 'settings-sharp' },
    { id: LibraryItems.LANGUAGE, label: t('language'), icon: 'language-sharp' },
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
    <LibraryItem key={item.id} label={item.label} icon={item.icon} index={index} onPress={() => handlePress(item.id)}/>
  );

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      <LanguageBottomSheet ref={languageBottomSheetRef}/>
      <ProfileCard/>
      <FlatList
        scrollEnabled={false}
        data={libraryItems}
        renderItem={renderLibraryItem}
      />
    </ScrollView>
  );
}

export default LibraryScreen;