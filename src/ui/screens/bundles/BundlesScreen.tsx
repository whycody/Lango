import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
    AppState,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { t } from 'i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../../hooks';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { useLanguage, useStatistics, useWordsBundle } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { Streak, WordsBundle } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { getCurrentStreak, getPrevMilestone } from '../../../utils/streakUtils';
import { ActionButton, BottomGradient, CustomText, Header, ScreenHeader } from '../../components';
import { BundleItem } from '../../components/bundles';
import { EmptyList, ListFilter } from '../../components/flashcards';
import { AddBundleBottomSheet, HandleBundleBottomSheet, LanguageBottomSheet } from '../../sheets';
import { JoinBundleWithCodeBottomSheet } from '../../sheets/JoinBundleWithCodeBottomSheet';
import { StartSessionBottomSheet } from '../../sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../Theme';

export const ADD_BUNDLE_SHEET_NAME = 'add-bundle-sheet';
const BUNDLES_LANGUAGE_SHEET_NAME = 'bundles-language-sheet';
const BUNDLES_START_SESSION_SHEET_NAME = 'bundles-start-session-sheet';
const HANDLE_BUNDLE_SHEET_NAME = 'handle-bundle-sheet';
const JOIN_WITH_CODE_SHEET_NAME = 'bundles-join-with-code-sheet';

export const BundlesScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang } = useLanguage();
    const { studyDaysList } = useStatistics();
    const bundles = useWordsBundle();
    const styles = getStyles(colors, insets);
    const { onScroll, style } = useDynamicStatusBar(100, 0.5);

    const [refreshing, setRefreshing] = useState(false);
    const [sessionBundleId, setSessionBundleId] = useState<string>();

    const [streak, setStreak] = useState<Streak>({
        active: false,
        numberOfDays: 0,
    });

    useLayoutEffect(() => {
        setStreak(getCurrentStreak(studyDaysList));
    }, [studyDaysList]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', state => {
            if (state !== 'active') return;
            setStreak(getCurrentStreak(studyDaysList));
        });

        return () => subscription.remove();
    }, [studyDaysList]);

    const isGoal = streak.active && streak.numberOfDays === getPrevMilestone(streak.numberOfDays);

    const handleLanguageSheetOpen = useCallback(() => {
        trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
            source: 'bundles_screen',
            type: 'main',
        });
        TrueSheet.present(BUNDLES_LANGUAGE_SHEET_NAME);
    }, []);

    const handleAddNewPress = useCallback(() => {
        TrueSheet.present(ADD_BUNDLE_SHEET_NAME);
    }, []);

    const handleSearchPress = useCallback(() => {
        navigation.navigate(ScreenName.SearchBundles);
    }, [navigation]);

    const handleCreateNewBundle = useCallback(() => {
        TrueSheet.present(HANDLE_BUNDLE_SHEET_NAME);
    }, []);

    const handleBundleCreated = useCallback(
        (bundle: WordsBundle) => {
            navigation.navigate(ScreenName.BundleNavigator, {
                bundleId: bundle.id,
                isNewBundle: true,
            });
        },
        [navigation],
    );

    const handleJoinBundleWithCodePress = useCallback(() => {
        TrueSheet.present(JOIN_WITH_CODE_SHEET_NAME);
    }, []);

    const handleJoiningBundleWithCode = useCallback(() => {}, []);

    const handleJoinedBundleWithCode = useCallback(
        (bundleId: string) => {
            navigation.navigate(ScreenName.BundleNavigator, {
                bundleId,
                isNewBundle: false,
                justJoined: true,
            });
        },
        [navigation],
    );

    const handleBundlePress = useCallback(
        (bundle: EnrichedWordsBundle) => {
            navigation.navigate(ScreenName.BundleNavigator, {
                bundleId: bundle.id,
                isNewBundle: false,
            });
        },
        [navigation],
    );

    const handleBundlePlayPress = useCallback((bundle: EnrichedWordsBundle) => {
        setSessionBundleId(bundle.id);
        TrueSheet.present(BUNDLES_START_SESSION_SHEET_NAME);
    }, []);

    const handleSessionStart = useCallback(
        (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => {
            if (!sessionBundleId) return;
            TrueSheet.dismissAll();
            navigation.navigate(ScreenName.Session, {
                bundleId: sessionBundleId,
                flashcardSide,
                length,
                mode,
            });
        },
        [navigation, sessionBundleId],
    );

    const renderBundleItem = ({ index, item }: { index: number; item: EnrichedWordsBundle }) => (
        <BundleItem
            key={item.id}
            bundle={item}
            index={index}
            onPlayPress={handleBundlePlayPress}
            onPress={handleBundlePress}
        />
    );

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await bundles.syncBundles();
        } finally {
            setRefreshing(false);
        }
    }, [bundles]);

    return (
        <>
            <BottomGradient />
            <LanguageBottomSheet sheetName={BUNDLES_LANGUAGE_SHEET_NAME} />
            <StartSessionBottomSheet
                sheetName={BUNDLES_START_SESSION_SHEET_NAME}
                onSessionStart={handleSessionStart}
            />
            <AddBundleBottomSheet
                sheetName={ADD_BUNDLE_SHEET_NAME}
                onCreateNew={handleCreateNewBundle}
                onJoinWithCode={handleJoinBundleWithCodePress}
            />
            <HandleBundleBottomSheet
                sheetName={HANDLE_BUNDLE_SHEET_NAME}
                onBundleCreated={handleBundleCreated}
            />
            <JoinBundleWithCodeBottomSheet
                sheetName={JOIN_WITH_CODE_SHEET_NAME}
                onJoined={handleJoinedBundleWithCode}
                onJoining={handleJoiningBundleWithCode}
            />
            <View style={style} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        progressViewOffset={50}
                        refreshing={refreshing}
                        tintColor={colors.text}
                        onRefresh={onRefresh}
                    />
                }
                onScroll={onScroll}
            >
                <View style={styles.spacer} />
                <ScreenHeader
                    mainLang={mainLang}
                    streakActive={streak.active}
                    streakIsGoal={isGoal}
                    streakNumberOfDays={streak.numberOfDays}
                    title={t('bundles.title')}
                    onFlagPress={handleLanguageSheetOpen}
                />
                <CustomText style={styles.descText}>{t('bundles.desc')}</CustomText>
                <ActionButton
                    primary
                    label={t('bundles.add_new')}
                    style={styles.actionButton}
                    onPress={handleAddNewPress}
                />
                <Pressable onPress={handleSearchPress}>
                    <ListFilter
                        editable={false}
                        isSearching={false}
                        placeholder={t('bundles.start_search')}
                        pointerEvents="none"
                        styleRoot={{ marginTop: 15 }}
                        onClear={() => {}}
                    />
                </Pressable>
                <Header style={styles.sectionTitle} title={t('bundles.your_bundles')} />
                <FlatList
                    data={bundles.langBundles}
                    renderItem={renderBundleItem}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <EmptyList
                            description={t('bundles.no_bundles_desc')}
                            title={t('bundles.no_bundles')}
                        />
                    }
                />
                <Header style={styles.sectionTitle} title={t('bundles.recommended_bundles')} />
                <CustomText style={styles.recommendedText}>
                    {t('bundles.no_recommended_bundles')}
                </CustomText>
                <View style={styles.footer} />
            </ScrollView>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        actionButton: {
            marginTop: MARGIN_VERTICAL,
        },
        container: {
            flex: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        descText: {
            color: colors.white,
            fontSize: 14,
            lineHeight: 22,
            marginTop: 12,
            opacity: 0.8,
        },
        footer: {
            height: 50,
        },
        recommendedText: {
            color: colors.white300,
            fontSize: 13,
            lineHeight: 22,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.xxl,
            textAlign: 'center',
        },
        sectionTitle: {
            color: colors.white,
            fontSize: 16,
            marginBottom: MARGIN_VERTICAL / 2,
            marginTop: MARGIN_VERTICAL,
        },
        spacer: {
            height: insets.top + MARGIN_VERTICAL,
        },
    });
