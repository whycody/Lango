import { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { fontSize } from '../../../constants/typography';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import { useDynamicStatusBar } from '../../../hooks';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { TabsParamList } from '../../../navigation/TabsNavigator';
import { useLanguage, useStatistics, useWordsBundle } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { ThemeColors, WordsBundle, WordsBundleWithOwnerInfo } from '../../../types';
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
import { HandleBundleBottomSheet, JoinBundleWithCodeBottomSheet } from '../common/sheets';
import { SearchBundleListItem } from '../search/components';
import { BundleListItem, PremiumBanner } from './components';
import {
    ADD_BUNDLE_SHEET_NAME,
    BUNDLES_LANGUAGE_SHEET_NAME,
    BUNDLES_START_SESSION_SHEET_NAME,
    DASHBOARD_BUNDLES_PREVIEW_COUNT,
    DASHBOARD_FOOTER_HEIGHT,
    HANDLE_BUNDLE_SHEET_NAME,
    JOIN_WITH_CODE_SHEET_NAME,
    REFRESH_PROGRESS_VIEW_OFFSET,
    STATUS_BAR_APPEAR_OPACITY_THRESHOLD,
    STATUS_BAR_APPEAR_SCROLL_DISTANCE,
} from './constants';
import { hasRecommendedBundles, useRecommendedBundlesQuery } from './hooks';
import { AddBundleBottomSheet } from './sheets';

type BundlesDashboardScreenNavProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabsParamList, 'Bundles'>,
    NavigationProp<RootStackParamList>
>;

interface BundlesDashboardScreenProps {
    navigation: BundlesDashboardScreenNavProp;
}

const recommendedKeyExtractor = (item: WordsBundleWithOwnerInfo) => item.id;

export const BundlesDashboardScreen: FC<BundlesDashboardScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang, translationLang } = useLanguage();
    const { studyDaysList } = useStatistics();
    const { langBundles, syncBundles, touchBundleInteraction } = useWordsBundle();

    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);
    const { onScroll, style } = useDynamicStatusBar(
        STATUS_BAR_APPEAR_SCROLL_DISTANCE,
        STATUS_BAR_APPEAR_OPACITY_THRESHOLD,
    );

    const {
        data: recommendedBundles = [],
        isLoading: isRecommendedLoading,
        refetch: refetchRecommendedBundles,
    } = useRecommendedBundlesQuery(mainLang, translationLang);

    const previewBundles = langBundles.slice(0, DASHBOARD_BUNDLES_PREVIEW_COUNT);
    const hasMoreBundles = langBundles.length > DASHBOARD_BUNDLES_PREVIEW_COUNT;
    const showRecommendedBundles = hasRecommendedBundles(mainLang, translationLang);
    // A user with no bundles of their own sees the recommendations first.
    const hasNoBundles = langBundles.length === 0;

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

    const handleLanguageSheetOpen = () => {
        trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
            source: 'bundles_screen',
            type: 'main',
        });
        TrueSheet.present(BUNDLES_LANGUAGE_SHEET_NAME);
    };

    const handleAddNewPress = () => {
        TrueSheet.present(ADD_BUNDLE_SHEET_NAME);
    };

    const handleSearchPress = () => {
        navigation.navigate(ScreenName.SearchBundles);
    };

    const handleSeeAllBundlesPress = () => {
        navigation.navigate(ScreenName.AllBundles);
    };

    const handleCreateNewBundle = () => {
        TrueSheet.present(HANDLE_BUNDLE_SHEET_NAME);
    };

    const handleBundleCreated = (bundle: WordsBundle) => {
        navigation.navigate(ScreenName.BundleNavigator, {
            bundleId: bundle.id,
            isNewBundle: true,
        });
    };

    const handleJoinBundleWithCodePress = () => {
        TrueSheet.present(JOIN_WITH_CODE_SHEET_NAME);
    };

    const handleJoinedBundleWithCode = (bundleId: string) => {
        navigation.navigate(ScreenName.BundleNavigator, {
            bundleId,
            isNewBundle: false,
            justJoined: true,
        });
    };

    // Passed to a React.memo'd BundleListItem rendered in a FlatList — memoized to avoid
    // re-rendering every row when this screen re-renders.
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

    // Passed to the React.memo'd SearchBundleListItem rendered in a FlatList.
    const handleRecommendedBundlePress = useCallback(
        (bundle: WordsBundleWithOwnerInfo) => {
            navigation.navigate(ScreenName.BundleNavigator, {
                bundleId: bundle.id,
                previewBundle: bundle,
            });
        },
        [navigation],
    );

    const handleSessionStart = (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
        if (!sessionBundleId) return;
        touchBundleInteraction(sessionBundleId);
        TrueSheet.dismissAll();
        navigation.navigate(ScreenName.Session, {
            bundleId: sessionBundleId,
            flashcardSide,
            length,
            mode,
        });
    };

    const renderBundleItem = ({ index, item }: { index: number; item: EnrichedWordsBundle }) => (
        <BundleListItem
            key={item.id}
            bundle={item}
            index={index}
            onPlayPress={handleBundlePlayPress}
            onPress={handleBundlePress}
        />
    );

    const renderRecommendedBundleItem = ({
        index,
        item,
    }: {
        index: number;
        item: WordsBundleWithOwnerInfo;
    }) => (
        <SearchBundleListItem bundle={item} index={index} onPress={handleRecommendedBundlePress} />
    );

    const recommendedEmptyComponent = isRecommendedLoading ? (
        <ActivityIndicator color={colors.white300} style={styles.recommendedLoader} />
    ) : (
        <CustomText style={styles.recommendedText} tx="bundles.no_recommended_bundles" />
    );

    const yourBundlesSection = (
        <>
            <Header
                style={styles.sectionTitle}
                subtitleTx="bundles.your_bundles_short_desc"
                titleTx="bundles.your_bundles"
            />
            <FlatList
                data={previewBundles}
                renderItem={renderBundleItem}
                scrollEnabled={false}
                ListEmptyComponent={
                    <EmptyList
                        descriptionTx="bundles.no_bundles_desc"
                        style={styles.emptyBundlesList}
                        titleTx="bundles.no_bundles"
                    />
                }
            />
            {hasMoreBundles && (
                <ActionButton
                    icon="chevron-forward"
                    labelTx="bundles.see_all"
                    style={styles.seeAllButton}
                    onPress={handleSeeAllBundlesPress}
                />
            )}
        </>
    );

    const recommendedBundlesSection = showRecommendedBundles && (
        <>
            <Header
                style={styles.sectionTitle}
                subtitleTx="bundles.recommended_bundles_desc"
                titleTx="bundles.recommended_bundles"
            />
            <FlatList
                ListEmptyComponent={recommendedEmptyComponent}
                data={recommendedBundles}
                keyExtractor={recommendedKeyExtractor}
                renderItem={renderRecommendedBundleItem}
                scrollEnabled={false}
            />
        </>
    );

    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await Promise.all([syncBundles(), refetchRecommendedBundles()]);
        } finally {
            setRefreshing(false);
        }
    };

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
                    />
                </Pressable>
                <PremiumBanner style={styles.premiumBanner} />
                {hasNoBundles ? (
                    <>
                        {recommendedBundlesSection}
                        {yourBundlesSection}
                    </>
                ) : (
                    <>
                        {yourBundlesSection}
                        {recommendedBundlesSection}
                    </>
                )}
                <View style={styles.footer} />
            </ScrollView>
        </>
    );
};

const getStyles = (colors: ThemeColors, insets: EdgeInsets) =>
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
            fontSize: fontSize.l,
            lineHeight: 22,
            marginTop: spacing.l,
            opacity: 0.8,
        },
        emptyBundlesList: {
            marginVertical: spacing.xxl,
        },
        footer: {
            height: DASHBOARD_FOOTER_HEIGHT,
        },
        premiumBanner: {
            marginTop: 50,
        },
        recommendedLoader: {
            marginTop: spacing.xxl,
        },
        recommendedText: {
            color: colors.white300,
            fontSize: fontSize.m,
            lineHeight: 22,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.xxl,
            textAlign: 'center',
        },
        searchFilter: {
            marginTop: spacing.xl,
        },
        sectionTitle: {
            color: colors.white,
            fontSize: fontSize.xxl,
            marginBottom: spacing.l,
            marginTop: MARGIN_VERTICAL,
        },
        seeAllButton: {
            marginTop: spacing.l,
        },
        spacer: {
            height: insets.top + MARGIN_VERTICAL,
        },
    });
