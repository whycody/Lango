import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, NavigationProp, useTheme } from '@react-navigation/native';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../../hooks';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { TabsParamList } from '../../../navigation/TabsNavigator';
import { useLanguage, useStatistics, useWordsBundle } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { WordsBundle } from '../../../types';
import {
    ActionButton,
    BottomGradient,
    CustomText,
    Header,
    ScreenHeader,
} from '../../../ui/components';
import { EmptyList, ListFilter } from '../../../ui/components/flashcards';
import { LanguageBottomSheet } from '../../../ui/sheets';
import { StartSessionBottomSheet } from '../../../ui/sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../../ui/Theme';
import { trackEvent } from '../../../utils/analytics';
import { STREAK_DEFAULT_VALUE } from '../../../utils/constants';
import { getCurrentStreak, getPrevMilestone } from '../../../utils/streakUtils';
import { HandleBundleBottomSheet } from '../common/sheets/handle-bundle-bottom-sheet';
import { JoinBundleWithCodeBottomSheet } from '../common/sheets/join-bundle-with-code-bottom-sheet';
import { BundleListItem } from './components/bundle-list-item';
import {
    ADD_BUNDLE_SHEET_NAME,
    BUNDLES_LANGUAGE_SHEET_NAME,
    BUNDLES_START_SESSION_SHEET_NAME,
    HANDLE_BUNDLE_SHEET_NAME,
    JOIN_WITH_CODE_SHEET_NAME,
    REFRESH_PROGRESS_VIEW_OFFSET,
} from './constants';
import { AddBundleBottomSheet } from './sheets/add-bundle-bottom-sheet';

type BundlesDashboardScreenNavProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabsParamList, 'Bundles'>,
    NavigationProp<RootStackParamList>
>;

export const BundlesDashboardScreen = ({
    navigation,
}: {
    navigation: BundlesDashboardScreenNavProp;
}) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang } = useLanguage();
    const { studyDaysList } = useStatistics();
    const { langBundles, syncBundles } = useWordsBundle();

    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);
    const { onScroll, style } = useDynamicStatusBar(100, 0.5);

    const [refreshing, setRefreshing] = useState(false);
    const [sessionBundleId, setSessionBundleId] = useState<string>();

    const [streak, setStreak] = useState(STREAK_DEFAULT_VALUE);

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
        <BundleListItem
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
            await syncBundles();
        } finally {
            setRefreshing(false);
        }
    }, []);

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
            />
            <View style={style} />
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        progressViewOffset={REFRESH_PROGRESS_VIEW_OFFSET}
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
                    titleTx="bundles.title"
                    onFlagPress={handleLanguageSheetOpen}
                />
                <CustomText style={styles.descText} tx="bundles.desc" />
                <ActionButton
                    primary
                    labelTx="bundles.add_new"
                    style={styles.actionButton}
                    onPress={handleAddNewPress}
                />
                <Pressable onPress={handleSearchPress}>
                    <ListFilter
                        editable={false}
                        isSearching={false}
                        placeholderTx="bundles.start_search"
                        pointerEvents="none"
                        styleRoot={styles.searchFilter}
                        onClear={() => {}}
                    />
                </Pressable>
                <Header style={styles.sectionTitle} titleTx="bundles.your_bundles" />
                <FlatList
                    data={langBundles}
                    renderItem={renderBundleItem}
                    scrollEnabled={false}
                    ListEmptyComponent={
                        <EmptyList
                            descriptionTx="bundles.no_bundles_desc"
                            titleTx="bundles.no_bundles"
                        />
                    }
                />
                <Header style={styles.sectionTitle} titleTx="bundles.recommended_bundles" />
                <CustomText style={styles.recommendedText} tx="bundles.no_recommended_bundles" />
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
        searchFilter: {
            marginTop: 15,
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
