import { useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { LibraryItems } from '../../constants/Library';
import { useDynamicStatusBar } from '../../hooks';
import { ScreenName } from '../../navigation/AppStack';
import { useLanguage, useWords } from '../../store';
import { useAuth } from '../../store/AuthContext';
import { LibraryNavProp } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { LibraryItem } from '../components/library';
import { ProfileCard } from '../containers';
import { LanguageBottomSheet } from '../sheets';

export const LibraryScreen = () => {
    const { t } = useTranslation();
    const { langWords } = useWords();
    const navigation = useNavigation<LibraryNavProp>();
    const langContext = useLanguage();
    const languageBottomSheetRef = useRef<BottomSheetModal>();
    const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);

    const { onScroll, style } = useDynamicStatusBar(100, 0.3);
    const insets = useSafeAreaInsets();
    const styles = getStyles(insets);
    const authContext = useAuth();

    useEffect(() => {
        const handleBackPress = () => {
            if (bottomSheetIsShown) {
                languageBottomSheetRef.current?.dismiss();
                return true;
            }
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
        return () => subscription.remove();
    }, [bottomSheetIsShown]);

    const currentLang = langContext.languages.filter(
        lang => lang.languageCode === langContext.mainLang,
    )[0].languageName;

    const getMyWordsDesc = () => {
        const langWordsCount = langWords.filter(w => !w.removed).length;
        switch (langWordsCount) {
            case 0:
                return t('words_desc_empty');
            case 1:
                return t('words_desc_s');
            default:
                return t('words_desc', { words_number: `${langWordsCount}` });
        }
    };

    const libraryItems = [
        {
            description: t('settings_desc'),
            icon: 'settings-sharp',
            id: LibraryItems.SETTINGS,
            label: t('settings'),
        },
        {
            description: currentLang,
            icon: 'language-sharp',
            id: LibraryItems.LANGUAGE,
            label: t('main_language'),
        },
        {
            description: getMyWordsDesc(),
            icon: 'albums-sharp',
            id: LibraryItems.MY_WORDS,
            label: t('myWords'),
        },
        {
            description: t('logout_desc'),
            icon: 'log-out-sharp',
            id: LibraryItems.LOGOUT,
            label: t('logout'),
        },
        {
            id: LibraryItems.PRIVACY_POLICY,
            label: t('privacyPolicy'),
        },
        {
            id: LibraryItems.USE_CONDITIONS,
            label: t('useConditions'),
        },
    ];

    const handlePress = (id: number) => {
        switch (id) {
            case LibraryItems.MY_WORDS:
                navigation.navigate(ScreenName.Flashcards);
                break;
            case LibraryItems.LANGUAGE:
                trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
                    source: 'library_screen',
                    type: 'main',
                });
                languageBottomSheetRef.current?.present();
                break;
            case LibraryItems.LOGOUT:
                authContext.logout();
                break;
            case LibraryItems.PRIVACY_POLICY:
                trackEvent(AnalyticsEventName.OPEN_PRIVACY_POLICY);
                Linking.openURL(`${process.env.SITE_URL}/privacy_policy`);
                break;
            case LibraryItems.USE_CONDITIONS:
                trackEvent(AnalyticsEventName.OPEN_USE_CONDITIONS);
                Linking.openURL(`${process.env.SITE_URL}/terms_of_service`);
                break;
            case LibraryItems.SETTINGS:
                trackEvent(AnalyticsEventName.NAVIGATE_SETTINGS);
                navigation.navigate(ScreenName.Settings);
                break;
            default:
                break;
        }
    };

    const renderLibraryItem = ({ index, item }) => (
        <LibraryItem
            key={item.id}
            description={item.description}
            icon={item.icon}
            index={index}
            label={item.label}
            onPress={() => handlePress(item.id)}
        />
    );

    return (
        <>
            <View style={style} />
            <ScrollView showsHorizontalScrollIndicator={false} onScroll={onScroll}>
                <LanguageBottomSheet
                    ref={languageBottomSheetRef}
                    onChangeIndex={index => setBottomSheetIsShown(index >= 0)}
                />
                <View style={styles.spacer} />
                <ProfileCard />
                <FlatList
                    data={libraryItems}
                    renderItem={renderLibraryItem}
                    scrollEnabled={false}
                />
            </ScrollView>
        </>
    );
};

const getStyles = (insets: EdgeInsets) =>
    StyleSheet.create({
        spacer: {
            height: insets.top,
        },
    });
