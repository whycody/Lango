import { FC, useEffect, useMemo, useState } from 'react';
import { Animated, Keyboard, RefreshControl, Share, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { CompositeNavigationProp, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import {
    FlashcardSide,
    FlashcardSortingMethod,
    SessionLength,
} from '../../../constants/UserPreferences';
import {
    BundleStackParamList,
    RootStackParamList,
    ScreenName,
} from '../../../navigation/navigationTypes';
import {
    useEvaluations,
    useUserPreferences,
    useWords,
    useWordsBundle,
    useWordsWithDetails,
} from '../../../store';
import { ThemeColors, WordWithDetails } from '../../../types';
import { BottomGradient, DockedActionPanel } from '../../../ui/components';
import {
    FlashcardListItem,
    FlashcardsSubheader,
    ScrollToTopButton,
} from '../../../ui/components/flashcards';
import {
    FLASHCARD_DETAIL_BOTTOM_SHEET,
    FlashcardDetailsBottomSheet,
} from '../../../ui/sheets/FlashcardDetailsBottomSheet';
import { HandleFlashcardBottomSheet } from '../../../ui/sheets/HandleFlashcardBottomSheet';
import {
    MasteryFilter,
    MasteryFilterBottomSheet,
} from '../../../ui/sheets/MasteryFilterBottomSheet';
import { MicrophonePermissionBottomSheet } from '../../../ui/sheets/MicrophonePermissionBottomSheet';
import { RemoveFlashcardBottomSheet } from '../../../ui/sheets/RemoveFlashcardBottomSheet';
import { SortingMethodBottomSheet } from '../../../ui/sheets/SortingMethodBottomSheet';
import { StartSessionBottomSheet } from '../../../ui/sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../../ui/Theme';
import { isIOS } from '../../../utils/deviceUtils';
import { buildBundleLink } from '../../../utils/helpers';
import { JoinBundleWithCodeBottomSheet } from '../common/sheets/join-bundle-with-code-bottom-sheet';
import { BundleActionButtons } from './components/bundle-action-buttons';
import { BundleClassBadgesSection } from './components/bundle-class-badges-section';
import { BundleEmptyState } from './components/bundle-empty-state';
import { BundleFlashcardsTopBar } from './components/bundle-flashcards-top-bar';
import { BundleSubscribeToggle } from './components/bundle-subscribe-toggle';
import { BundleTitleSection } from './components/bundle-title-section';
import {
    BUNDLE_DETAILS_BUNDLE_OPTIONS_BOTTOM_SHEET,
    BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET,
    BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET,
    BUNDLE_DETAILS_JOIN_WITH_CODE_BOTTOM_SHEET,
    BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET,
    BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET,
    BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET,
    BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET,
    BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET,
    CONTENT_APPEAR_DURATION,
    CONTENT_APPEAR_TRANSLATE_Y,
    CONTENT_TITLE_SCROLL_END,
    CONTENT_TITLE_SCROLL_START,
    DOCKED_ACTION_PANEL_HEIGHT,
    TOP_BAR_ANDROID_HEIGHT,
    TOP_BAR_IOS_HEIGHT,
} from './constants';
import { useBundleInfo } from './hooks/use-bundle-info';
import { useBundleLifecycleSheets } from './hooks/use-bundle-lifecycle-sheets';
import { useBundleScrollAnimations } from './hooks/use-bundle-scroll-animations';
import { useBundleWordsData } from './hooks/use-bundle-words-data';
import { BundleOptionsBottomSheet } from './sheets/bundle-options-bottom-sheet';
import { BundleReadyBottomSheet } from './sheets/bundle-ready-bottom-sheet';
import { BundleListItem, BundleWord } from './types';

type BundleDetailsScreenNavProp = CompositeNavigationProp<
    NativeStackNavigationProp<BundleStackParamList, ScreenName.BundleFlashcards>,
    NativeStackNavigationProp<RootStackParamList>
>;

type BundleDetailsScreenProps = NativeStackScreenProps<
    BundleStackParamList,
    ScreenName.BundleFlashcards
> & {
    navigation: BundleDetailsScreenNavProp;
};

const keyExtractor = (item: BundleListItem) => item.id;

export const BundleDetailsScreen: FC<BundleDetailsScreenProps> = ({ navigation, route }) => {
    const { bundleId, code: joinCode, isNewBundle, justJoined, previewBundle } = route.params;
    const { i18n } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);

    const { editBundleMember, joinPreviewBundle, syncBundles } = useWordsBundle();
    const { addFetchedWords, removeWord, syncWords } = useWords();
    const { syncEvaluations } = useEvaluations();
    const { langWordsWithDetails } = useWordsWithDetails();
    const { flashcardsSortingMethod } = useUserPreferences();

    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
    const [editFlashcardId, setEditFlashcardId] = useState<string | undefined>(undefined);
    const [detailWord, setDetailWord] = useState<WordWithDetails | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);

    const {
        bottomPanelOpacity,
        contentAppear,
        handleHeaderButtonsLayout,
        handleHeaderLayout,
        handleScroll,
        handleScrollToTop,
        isBottomPanelVisible,
        isSubheaderStuck,
        listRef,
        scrollToTopAnim,
        scrollY,
    } = useBundleScrollAnimations();

    const topBarHeight = insets.top + (isIOS ? TOP_BAR_IOS_HEIGHT : TOP_BAR_ANDROID_HEIGHT);

    const listContentContainerStyle = useMemo(() => ({ paddingTop: topBarHeight }), [topBarHeight]);
    const subheaderOverlayStyle = useMemo(
        () => [styles.subheaderOverlay, { opacity: isSubheaderStuck ? 1 : 0, top: topBarHeight }],
        [styles.subheaderOverlay, isSubheaderStuck, topBarHeight],
    );

    const contentTitleOpacity = useMemo(
        () =>
            scrollY.interpolate({
                extrapolate: 'clamp',
                inputRange: [CONTENT_TITLE_SCROLL_START, CONTENT_TITLE_SCROLL_END],
                outputRange: [1, 0],
            }),
        [scrollY],
    );

    const headerAppearStyle = useMemo(
        () => ({
            opacity: contentAppear,
            transform: [
                {
                    translateY: contentAppear.interpolate({
                        inputRange: [0, 1],
                        outputRange: [CONTENT_APPEAR_TRANSLATE_Y, 0],
                    }),
                },
            ],
        }),
        [contentAppear],
    );

    const {
        bundle,
        canAddWords,
        isBundleQueryLoading,
        isPreview,
        isPrivatePreview,
        localBundle,
        membership,
        previewOwnerInfo,
        refetchBundle,
    } = useBundleInfo(bundleId, previewBundle);

    const isBundleOwner = membership?.role === 'owner';

    const [hasContentAppeared, setHasContentAppeared] = useState(false);

    const { isJoiningBundle, setIsJoiningBundle } = useBundleLifecycleSheets(
        navigation,
        hasContentAppeared,
        isNewBundle,
        justJoined,
        joinCode,
        membership,
        localBundle,
    );

    const {
        bundleWords,
        bundleWordsMLStates,
        flashcardsCount,
        isBundleWordsFetching,
        localBundleWords,
        previewSortingMethod,
        refetchBundleWords,
        remoteBundleWords,
        words,
    } = useBundleWordsData(
        bundleId,
        isPreview,
        isPrivatePreview,
        previewOwnerInfo,
        masteryFilter,
        isJoiningBundle,
    );

    useEffect(() => {
        Animated.timing(contentAppear, {
            duration: CONTENT_APPEAR_DURATION,
            toValue: 1,
            useNativeDriver: true,
        }).start(() => setHasContentAppeared(true));
    }, [contentAppear]);

    useEffect(() => {
        if (!bundle && !isBundleQueryLoading) {
            navigation.goBack();
        }
    }, [bundle, isBundleQueryLoading, navigation]);

    const handleStartSessionPress = () => {
        TrueSheet.present(BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET);
    };

    const handleAddWordPress = () => {
        Keyboard.dismiss();
        setEditFlashcardId(undefined);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handleBundleReadyAddWordsPress = () => {
        TrueSheet.dismiss(BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET);
        setEditFlashcardId(undefined);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            await Promise.all(
                isPreview
                    ? [refetchBundle(), refetchBundleWords()]
                    : [syncBundles(), syncWords(), syncEvaluations()],
            );
        } finally {
            setRefreshing(false);
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleMoreOptionsPress = () => {
        if (isPreview) return;
        TrueSheet.present(BUNDLE_DETAILS_BUNDLE_OPTIONS_BOTTOM_SHEET);
    };

    const handleBundleRemoved = () => {
        navigation.goBack();
    };

    const handleBundleLeft = () => {};

    const handleSubscribedToggle = () => {
        if (!membership) return;
        editBundleMember({ id: membership.id, subscribed: !membership.subscribed });
    };

    const handleShareBundleLinkPress = () => {
        Share.share({
            message: buildBundleLink(bundleId, i18n.language),
        });
    };

    const handleJoinWithCodePress = () => {
        TrueSheet.present(BUNDLE_DETAILS_JOIN_WITH_CODE_BOTTOM_SHEET);
    };

    const handleJoiningWithCode = () => {
        setIsJoiningBundle(true);
    };

    const handleJoinedWithCode = () => {};

    const joinPreviewBundleWithWords = async () => {
        if (!previewOwnerInfo) return undefined;

        const fetchedWords = isBundleWordsFetching
            ? (await refetchBundleWords()).data
            : remoteBundleWords;

        const member = await joinPreviewBundle(previewOwnerInfo);
        await addFetchedWords(fetchedWords ?? []);

        return { member, wordsCount: fetchedWords?.length ?? 0 };
    };

    const tryJoinPreviewBundleWithWords = async () => {
        setIsJoiningBundle(true);
        try {
            await joinPreviewBundleWithWords();
        } finally {
            setIsJoiningBundle(false);
        }
    };

    const handleAddToMyBundlesPress = async () => {
        if (!previewOwnerInfo) return;
        await tryJoinPreviewBundleWithWords();
    };

    const handleBundleReadyStartSessionPress = () => {
        TrueSheet.dismiss(BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET);
        TrueSheet.present(BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET);
    };

    const bundleActionButtonsSharedProps = {
        canAddWords,
        hasWords: bundleWords.length > 0,
        isBundleWordsFetching,
        isJoiningBundle,
        isPreview,
        isPrivatePreview,
        onAddToMyBundlesPress: handleAddToMyBundlesPress,
        onAddWordPress: handleAddWordPress,
        onJoinWithCodePress: handleJoinWithCodePress,
        onShareBundleLinkPress: handleShareBundleLinkPress,
        onStartSessionPress: handleStartSessionPress,
    };

    const handleSessionStart = async (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
        if (isPreview && previewOwnerInfo) {
            await tryJoinPreviewBundleWithWords();
        }

        TrueSheet.dismissAll();
        navigation.navigate(ScreenName.Session, {
            bundleId,
            flashcardSide,
            length,
            mode,
        });
    };

    const handlePress = (id: string) => {
        const word = langWordsWithDetails.find(w => w.id === id);
        if (!word) return;
        setDetailWord(word);
        TrueSheet.present(FLASHCARD_DETAIL_BOTTOM_SHEET);
    };

    const openFlashcardActionSheet = (id: string, sheetName: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        TrueSheet.present(sheetName);
    };

    const handleEditPress = (id: string) =>
        openFlashcardActionSheet(id, BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);

    const handleRemovePress = (id: string) =>
        openFlashcardActionSheet(id, BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET);

    const handleWordEdit = (id: string | undefined, word: string, translation: string) => {
        if (!id) return;
        setDetailWord(prev => (prev?.id === id ? { ...prev, text: word, translation } : prev));
    };

    const handleRemoveCancel = () => {
        TrueSheet.dismiss(BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET);
        setEditFlashcardId(undefined);
    };

    const handleRemoveConfirm = () => {
        TrueSheet.dismissAll();
        if (!editFlashcardId) return;
        removeWord(editFlashcardId);
        setEditFlashcardId(undefined);
        setDetailWord(undefined);
    };

    const renderWordItem = (
        { gradeThreeProb, id, text, translation }: BundleWord,
        index: number,
    ) => (
        <FlashcardListItem
            id={id}
            index={index}
            level={gradeThreeProb}
            text={text}
            translation={translation}
            onPress={isPreview ? undefined : handlePress}
        />
    );

    const renderHeader = () => (
        <Animated.View style={headerAppearStyle} onLayout={handleHeaderLayout}>
            <BundleTitleSection
                bundle={bundle}
                colors={colors}
                contentTitleOpacity={contentTitleOpacity}
                flashcardsCount={flashcardsCount}
                previewOwnerName={isPreview ? previewOwnerInfo?.ownerName : undefined}
                previewOwnerPicture={isPreview ? previewOwnerInfo?.ownerPicture : undefined}
            />

            {!isPreview && (
                <BundleClassBadgesSection
                    mlStates={bundleWordsMLStates}
                    onMasteryFilterChange={setMasteryFilter}
                />
            )}

            {membership && (
                <BundleSubscribeToggle
                    subscribed={membership.subscribed}
                    onToggle={handleSubscribedToggle}
                />
            )}

            <View style={styles.headerButtons} onLayout={handleHeaderButtonsLayout}>
                <BundleActionButtons
                    {...bundleActionButtonsSharedProps}
                    primaryButtonStyle={styles.headerStartButton}
                />
            </View>
        </Animated.View>
    );

    const renderSubheader = () => (
        <FlashcardsSubheader
            filterSheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
            masteryFilter={masteryFilter}
            showFilter={!isPreview}
            showSearch={false}
            sortingMethod={isPreview ? previewSortingMethod : flashcardsSortingMethod}
            sortingSheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
        />
    );

    const renderEmptyList = () => (
        <BundleEmptyState
            canAddWords={canAddWords}
            flashcardsCount={flashcardsCount}
            hasBundle={!!bundle}
            isBundleWordsFetching={isBundleWordsFetching}
            isJoiningBundle={isJoiningBundle}
            isPrivatePreview={isPrivatePreview}
            masteryFilter={masteryFilter}
        />
    );

    const renderListItem = ({ index, item }: { index: number; item: BundleListItem }) => {
        if (item.id === 'header') return renderHeader();
        if (item.id === 'subheader') return renderSubheader();
        if (item.id === 'empty') return renderEmptyList();
        return renderWordItem(item as BundleWord, index - 2);
    };

    const renderRefreshControl = () => (
        <RefreshControl
            progressViewOffset={topBarHeight}
            refreshing={refreshing}
            tintColor={colors.white}
            onRefresh={handleRefresh}
        />
    );

    const renderListFooter = () => <View style={styles.listFooter} />;

    const listData = useMemo<BundleListItem[]>(
        () => [
            { id: 'header' as const },
            { id: 'subheader' as const },
            ...(bundle && words.length > 0 && !isPrivatePreview
                ? words
                : [{ id: 'empty' as const }]),
        ],
        [bundle, words, isPrivatePreview],
    );

    const availableSortingMethods = isPreview
        ? [FlashcardSortingMethod.ADD_DATE_DESC, FlashcardSortingMethod.ADD_DATE_ASC]
        : undefined;

    return (
        <View style={styles.root}>
            <BundleFlashcardsTopBar
                insets={insets}
                scrollY={scrollY}
                title={bundle?.title ?? ''}
                onBackPress={handleBackPress}
                onMoreOptionsPress={handleMoreOptionsPress}
            />
            <StartSessionBottomSheet
                loading={isJoiningBundle}
                sheetName={BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET}
                onSessionStart={handleSessionStart}
            />
            <FlashcardDetailsBottomSheet
                word={detailWord}
                onEdit={() => handleEditPress(detailWord?.id ?? '')}
                onRemove={() => handleRemovePress(detailWord?.id ?? '')}
            />
            <RemoveFlashcardBottomSheet
                flashcardId={editFlashcardId}
                sheetName={BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET}
                onCancel={handleRemoveCancel}
                onRemove={handleRemoveConfirm}
            />
            <BundleOptionsBottomSheet
                bundleId={bundleId}
                isOwner={isBundleOwner}
                sheetName={BUNDLE_DETAILS_BUNDLE_OPTIONS_BOTTOM_SHEET}
                onBundleLeft={handleBundleLeft}
                onBundleRemoved={handleBundleRemoved}
            />
            <MicrophonePermissionBottomSheet
                sheetName={BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET}
            />
            <BundleReadyBottomSheet
                isNewBundle={isNewBundle}
                sheetName={BUNDLE_DETAILS_BUNDLE_READY_BOTTOM_SHEET}
                userHasEditPermission={canAddWords}
                wordsAreAvailable={localBundleWords.length > 0}
                onAddWordsPress={handleBundleReadyAddWordsPress}
                onStartSessionPress={handleBundleReadyStartSessionPress}
            />
            <JoinBundleWithCodeBottomSheet
                bundleId={bundleId}
                initialCode={joinCode}
                sheetName={BUNDLE_DETAILS_JOIN_WITH_CODE_BOTTOM_SHEET}
                onJoined={handleJoinedWithCode}
                onJoining={handleJoiningWithCode}
            />
            <HandleFlashcardBottomSheet
                bundleId={bundleId}
                flashcardId={editFlashcardId}
                microphonePermissionSheetName={BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET}
                sheetName={BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET}
                onWordEdit={handleWordEdit}
            />
            <MasteryFilterBottomSheet
                sheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
                value={masteryFilter}
                onChange={setMasteryFilter}
            />
            <SortingMethodBottomSheet
                availableMethods={availableSortingMethods}
                sheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
            />
            <FlashList
                ListEmptyComponent={renderEmptyList}
                ListFooterComponent={renderListFooter}
                contentContainerStyle={listContentContainerStyle}
                data={listData}
                keyExtractor={keyExtractor}
                overScrollMode="never"
                ref={listRef}
                refreshControl={renderRefreshControl()}
                renderItem={renderListItem}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
            />
            <View pointerEvents={isSubheaderStuck ? 'auto' : 'none'} style={subheaderOverlayStyle}>
                <FlashcardsSubheader
                    filterSheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
                    masteryFilter={masteryFilter}
                    showFilter={!isPreview}
                    showSearch={false}
                    sortingMethod={isPreview ? previewSortingMethod : flashcardsSortingMethod}
                    sortingSheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
                />
            </View>
            <DockedActionPanel style={styles.buttonsContainer} visible={isBottomPanelVisible}>
                <BundleActionButtons
                    {...bundleActionButtonsSharedProps}
                    buttonStyle={styles.button}
                />
            </DockedActionPanel>
            <ScrollToTopButton
                addButtonAnim={bottomPanelOpacity}
                animatedValue={scrollToTopAnim}
                liftOffset={insets.bottom + DOCKED_ACTION_PANEL_HEIGHT}
                onPress={handleScrollToTop}
            />
            <BottomGradient />
        </View>
    );
};

const getStyles = (colors: ThemeColors, insets: EdgeInsets) =>
    StyleSheet.create({
        button: {
            flex: 1,
        },
        buttonsContainer: {
            flex: 1,
            flexDirection: 'row',
            gap: spacing.m,
        },
        headerButtons: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        headerStartButton: {
            marginBottom: spacing.l,
            marginTop: spacing.m,
        },
        listFooter: {
            height: insets.bottom + spacing.l + DOCKED_ACTION_PANEL_HEIGHT + MARGIN_VERTICAL,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            height: '100%',
        },
        subheaderOverlay: {
            left: 0,
            position: 'absolute',
            right: 0,
            zIndex: 15,
        },
    });
