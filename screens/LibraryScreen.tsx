import { FlatList, ScrollView } from "react-native";
import ProfileCard from "../cards/library/ProfileCard";
import { useTranslation } from "react-i18next";
import LibraryItem from "../components/LibraryItem";

const LibraryScreen = () => {
  const { t } = useTranslation();
  const libraryItems = [
    { label: t('settings'), icon: 'settings-sharp' },
    { label: t('myWords'), icon: 'albums-sharp' },
    { label: t('logout'), icon: 'log-out-sharp' },
    { label: t('privacyPolicy') },
    { label: t('useConditions') },
  ]

  const renderLibraryItem = ({ item, index }) => (
    <LibraryItem label={item.label} icon={item.icon} index={index}/>
  );

  return (
    <ScrollView showsHorizontalScrollIndicator={false}>
      <ProfileCard/>
      <FlatList
        scrollEnabled={false}
        data={libraryItems}
        keyExtractor={(item) => item.label}
        renderItem={renderLibraryItem}
      />
    </ScrollView>
  );
}

export default LibraryScreen;