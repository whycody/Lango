import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    Share,
    StyleSheet,
    View,
} from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import {
    FlashcardSide,
    FlashcardSortingMethod,
    SessionLength,
} from '../../../constants/UserPreferences';
import { useBundleQuery } from '../../../hooks/useBundleQuery';
import { useBundleWordsQuery } from '../../../hooks/useBundleWordsQuery';
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
    useWordsMLStatesContext,
    useWordsWithDetails,
} from '../../../store';
import { Word, WordWithDetails } from '../../../types';
import { isIOS } from '../../../utils/deviceUtils';
import { getSortingMethod } from '../../../utils/sortingUtil';
import { ActionButton, BottomGradient, CustomText, DockedActionPanel } from '../../components';
import {
    BUNDLE_SUBTITLE_LINE_HEIGHT,
    BUNDLE_TITLE_LINE_HEIGHT,
    BundleFlashcardsTopBar,
    BundleHeaderSkeleton,
} from '../../components/bundles';
import {
    EmptyList,
    FlashcardListItem,
    FlashcardsSubheader,
    ScrollToTopButton,
} from '../../components/flashcards';
import { BundleCreatorInfo, FlashcardClassBadges } from '../../components/home';
import { LibraryItem } from '../../components/library';
import { FlashcardsSelectionSkeleton } from '../../containers/onboarding/FlashcardsSelectionSkeleton';
import { BundleAddedBottomSheet } from '../../sheets/BundleAddedBottomSheet';
import { BundleOptionsBottomSheet } from '../../sheets/BundleOptionsBottomSheet';
import {
    FLASHCARD_DETAIL_BOTTOM_SHEET,
    FlashcardDetailsBottomSheet,
} from '../../sheets/FlashcardDetailsBottomSheet';
import { HandleFlashcardBottomSheet } from '../../sheets/HandleFlashcardBottomSheet';
import { MasteryFilter, MasteryFilterBottomSheet } from '../../sheets/MasteryFilterBottomSheet';
import { MicrophonePermissionBottomSheet } from '../../sheets/MicrophonePermissionBottomSheet';
import { NewBundleBottomSheet } from '../../sheets/NewBundleBottomSheet';
import { RemoveFlashcardBottomSheet } from '../../sheets/RemoveFlashcardBottomSheet';
import { SortingMethodBottomSheet } from '../../sheets/SortingMethodBottomSheet';
import { StartSessionBottomSheet } from '../../sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../Theme';

const BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET = 'bundle-details-start-session-bottom-sheet';
const BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET = 'bundle-details-mastery-filter-bottom-sheet';
const BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET = 'bundle-details-sorting-method-bottom-sheet';
const BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET = 'bundle-details-handle-flashcard-bottom-sheet';
const BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET = 'bundle-details-microphone-permission';
const BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET = 'bundle-details-remove-flashcard-bottom-sheet';
const BUNDLE_DETAILS_NEW_BUNDLE_BOTTOM_SHEET = 'bundle-details-new-bundle-bottom-sheet';
const BUNDLE_DETAILS_BUNDLE_ADDED_BOTTOM_SHEET = 'bundle-details-bundle-added-bottom-sheet';
const BUNDLE_DETAILS_BUNDLE_OPTIONS_BOTTOM_SHEET = 'bundle-details-bundle-options-bottom-sheet';
const SCROLL_TO_TOP_THRESHOLD = 300;
const CONTENT_TITLE_SCROLL_START = 40;
const CONTENT_TITLE_SCROLL_END = 80;
const BOTTOM_PANEL_SHOW_OFFSET = -20;

type BundleDetailsScreenProps = NativeStackScreenProps<
    BundleStackParamList,
    ScreenName.BundleFlashcards
>;

type BundleWord = Word & { gradeThreeProb: number };

type BundleListItem = BundleWord | { id: 'header' | 'subheader' | 'empty' };

export const BundleDetailsScreen = ({ route }: BundleDetailsScreenProps) => {
    const { bundleId, isNewBundle, previewBundle } = route.params;
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = useMemo(() => getStyles(colors, insets), [colors, insets]);

    const { bundles, editBundleMember, joinPreviewBundle, syncBundles } = useWordsBundle();
    const { langWordsWithDetails } = useWordsWithDetails();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { flashcardsSortingMethod } = useUserPreferences();

    const { addFetchedWords, removeWord, syncWords } = useWords();
    const { syncEvaluations } = useEvaluations();

    const TOP_BAR_HEIGHT = isIOS ? 44 + insets.top : insets.top + 56;

    const contentAppear = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollToTopAnim = useRef(new Animated.Value(0)).current;
    const listRef = useRef<FlashListRef<BundleListItem>>(null);
    const scrollToTopVisible = useRef(false);
    const headerButtonsBottomRef = useRef<number | undefined>(undefined);

    const contentTitleOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [CONTENT_TITLE_SCROLL_START, CONTENT_TITLE_SCROLL_END],
        outputRange: [1, 0],
    });

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            scrollY.setValue(offsetY);

            const shouldShowScrollToTop = offsetY > SCROLL_TO_TOP_THRESHOLD;
            if (shouldShowScrollToTop !== scrollToTopVisible.current) {
                scrollToTopVisible.current = shouldShowScrollToTop;
                Animated.timing(scrollToTopAnim, {
                    duration: 200,
                    toValue: shouldShowScrollToTop ? 1 : 0,
                    useNativeDriver: true,
                }).start();
            }

            if (headerButtonsBottomRef.current === undefined) return;
            const shouldShowBottomPanel =
                offsetY > headerButtonsBottomRef.current + BOTTOM_PANEL_SHOW_OFFSET;
            setIsBottomPanelVisible(prev =>
                prev === shouldShowBottomPanel ? prev : shouldShowBottomPanel,
            );
        },
        [scrollY, scrollToTopAnim],
    );

    const handleScrollToTop = useCallback(() => {
        listRef.current?.scrollToOffset({ animated: true, offset: 0 });
    }, []);

    useEffect(() => {
        Animated.timing(contentAppear, {
            duration: 280,
            toValue: 1,
            useNativeDriver: true,
        }).start();
    }, [contentAppear]);

    const localBundle = bundles.find(b => b.id === bundleId);
    const isPreview = !localBundle;

    const {
        data: previewOwnerInfo,
        isLoading: isBundleQueryLoading,
        refetch: refetchBundle,
    } = useBundleQuery(bundleId, isPreview, previewBundle);

    const bundle =
        localBundle ??
        (previewOwnerInfo ? { ...previewOwnerInfo, membership: undefined } : undefined);

    const membership = bundle?.membership;
    const canAddWords =
        !isPreview && (membership?.role === 'owner' || membership?.role === 'editor');

    const {
        data: remoteBundleWords,
        isFetching: isBundleWordsFetching,
        refetch: refetchBundleWords,
    } = useBundleWordsQuery(bundleId, isPreview || (!!localBundle && !localBundle.wordsBackfilled));

    useEffect(() => {
        if (!bundle && !isBundleQueryLoading) {
            navigation.goBack();
        }
    }, [bundle, isBundleQueryLoading, navigation]);

    useEffect(() => {
        if (!isNewBundle) return;

        const presentNewBundleSheet = () => {
            TrueSheet.present(BUNDLE_DETAILS_NEW_BUNDLE_BOTTOM_SHEET);
            navigation.setParams({ isNewBundle: false });
        };

        return navigation.addListener('transitionEnd', presentNewBundleSheet);
    }, [isNewBundle, navigation]);

    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
    const [editFlashcardId, setEditFlashcardId] = useState<string | undefined>(undefined);
    const [detailWord, setDetailWord] = useState<WordWithDetails | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);
    const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(false);
    const [isJoiningBundle, setIsJoiningBundle] = useState(false);

    const bottomPanelOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(bottomPanelOpacity, {
            duration: 220,
            toValue: isBottomPanelVisible ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [isBottomPanelVisible, bottomPanelOpacity]);

    const handleHeaderButtonsLayout = useCallback((event: LayoutChangeEvent) => {
        const { height, y } = event.nativeEvent.layout;
        headerButtonsBottomRef.current = y + height;
    }, []);

    const previewBundleWords = useMemo<BundleWord[]>(
        () => (remoteBundleWords ?? []).map(word => ({ ...word, gradeThreeProb: 0 })),
        [remoteBundleWords],
    );

    const localBundleWords = useMemo(
        () => langWordsWithDetails.filter(word => word.bundleId === bundleId),
        [langWordsWithDetails, bundleId],
    );

    const bundleWords: BundleWord[] =
        isPreview || (isJoiningBundle && localBundleWords.length === 0)
            ? previewBundleWords
            : localBundleWords;

    const flashcardsCount = isPreview
        ? (previewOwnerInfo?.flashcardsCount ?? bundleWords.length)
        : bundleWords.length;

    const bundleWordsMLStates = useMemo(() => {
        const bundleWordIds = new Set(bundleWords.map(word => word.id));
        return langWordsMLStates?.filter(state => bundleWordIds.has(state.wordId)) ?? [];
    }, [langWordsMLStates, bundleWords]);

    const matchesMasteryFilter = useCallback(
        (word: BundleWord) => {
            if (masteryFilter === 'all') return true;
            if (masteryFilter === 'learning')
                return word.gradeThreeProb <= GRADE_THREE_PROB_THRESHOLDS.BAD_MAX;
            if (masteryFilter === 'review')
                return (
                    word.gradeThreeProb > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX &&
                    word.gradeThreeProb < GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN
                );
            if (masteryFilter === 'mastered')
                return word.gradeThreeProb >= GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN;
            return true;
        },
        [masteryFilter],
    );

    const previewSortingMethod =
        flashcardsSortingMethod === FlashcardSortingMethod.ADD_DATE_ASC
            ? FlashcardSortingMethod.ADD_DATE_ASC
            : FlashcardSortingMethod.ADD_DATE_DESC;

    const sortByAddDate = useCallback(
        (a: BundleWord, b: BundleWord) => {
            const direction = previewSortingMethod === FlashcardSortingMethod.ADD_DATE_ASC ? 1 : -1;
            return direction * (new Date(a.addDate).getTime() - new Date(b.addDate).getTime());
        },
        [previewSortingMethod],
    );

    const words = useMemo(
        () =>
            isPreview
                ? previewBundleWords.slice().sort(sortByAddDate)
                : localBundleWords
                      .filter(matchesMasteryFilter)
                      .sort(getSortingMethod(flashcardsSortingMethod)),
        [
            isPreview,
            previewBundleWords,
            sortByAddDate,
            localBundleWords,
            matchesMasteryFilter,
            flashcardsSortingMethod,
        ],
    );

    const handleStartSessionPress = () => {
        TrueSheet.present(BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET);
    };

    const handleAddWordPress = () => {
        Keyboard.dismiss();
        setEditFlashcardId(undefined);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handleNewBundleAddWordsPress = () => {
        TrueSheet.dismiss(BUNDLE_DETAILS_NEW_BUNDLE_BOTTOM_SHEET);
        setEditFlashcardId(undefined);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handleRefresh = useCallback(async () => {
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
    }, [isPreview, refetchBundle, refetchBundleWords, syncBundles, syncWords, syncEvaluations]);

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

    const handleBundleLeft = () => {
        if (bundle?.visibility === 'private') {
            navigation.goBack();
        }
    };

    const handleSubscribedToggle = () => {
        if (!membership) return;
        editBundleMember({ id: membership.id, subscribed: !membership.subscribed });
    };

    const handleShareBundlePress = () => {
        Share.share({ message: `https://app.lango.ovh/bundle/${bundleId}` });
    };

    const joinPreviewBundleWithWords = async () => {
        if (!previewOwnerInfo) return;

        const words = isBundleWordsFetching ? (await refetchBundleWords()).data : remoteBundleWords;

        await joinPreviewBundle(previewOwnerInfo);
        await addFetchedWords(words ?? []);
    };

    const handleAddToMyBundlesPress = async () => {
        if (!previewOwnerInfo) return;

        try {
            setIsJoiningBundle(true);
            await joinPreviewBundleWithWords();
            TrueSheet.present(BUNDLE_DETAILS_BUNDLE_ADDED_BOTTOM_SHEET);
        } finally {
            setIsJoiningBundle(false);
        }
    };

    const handleBundleAddedStartSessionPress = () => {
        TrueSheet.dismiss(BUNDLE_DETAILS_BUNDLE_ADDED_BOTTOM_SHEET);
        TrueSheet.present(BUNDLE_DETAILS_START_SESSION_BOTTOM_SHEET);
    };

    const handleSessionStart = async (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
        if (isPreview && previewOwnerInfo) {
            try {
                setIsJoiningBundle(true);
                await joinPreviewBundleWithWords();
            } finally {
                setIsJoiningBundle(false);
            }
        }

        TrueSheet.dismissAll();
        navigation.navigate(ScreenName.Session, {
            bundleId,
            flashcardSide,
            length,
            mode,
        });
    };

    const handlePress = useCallback(
        (id: string) => {
            const word = langWordsWithDetails.find(w => w.id === id);
            if (!word) return;
            setDetailWord(word);
            TrueSheet.present(FLASHCARD_DETAIL_BOTTOM_SHEET);
        },
        [langWordsWithDetails],
    );

    const handleEditPress = useCallback((id: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    }, []);

    const handleRemovePress = useCallback((id: string) => {
        Keyboard.dismiss();
        setEditFlashcardId(id);
        TrueSheet.present(BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET);
    }, []);

    const handleWordEdit = useCallback(
        (id: string | undefined, word: string, translation: string) => {
            if (!id) return;
            setDetailWord(prev => (prev?.id === id ? { ...prev, text: word, translation } : prev));
        },
        [],
    );

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

    const renderWordItem = useCallback(
        ({ gradeThreeProb, id, text, translation }: BundleWord, index: number) => (
            <FlashcardListItem
                id={id}
                index={index}
                level={gradeThreeProb}
                text={text}
                translation={translation}
                onPress={isPreview ? undefined : handlePress}
            />
        ),
        [isPreview, handlePress],
    );

    const renderHeader = useCallback(
        () => (
            <Animated.View
                style={{
                    opacity: contentAppear,
                    transform: [
                        {
                            translateY: contentAppear.interpolate({
                                inputRange: [0, 1],
                                outputRange: [12, 0],
                            }),
                        },
                    ],
                }}
            >
                {bundle ? (
                    <>
                        <Animated.View style={{ opacity: contentTitleOpacity }}>
                            <CustomText style={styles.title} weight="Bold">
                                {bundle.title}
                            </CustomText>
                        </Animated.View>
                        {bundle.description && (
                            <CustomText style={styles.subtitle}>{bundle.description}</CustomText>
                        )}

                        <BundleCreatorInfo
                            creatorId={bundle.ownerId ?? ''}
                            flashcardsCount={flashcardsCount}
                            name={isPreview ? previewOwnerInfo?.ownerName : undefined}
                            picture={isPreview ? previewOwnerInfo?.ownerPicture : undefined}
                            style={styles.creatorInfo}
                        />
                    </>
                ) : (
                    <BundleHeaderSkeleton />
                )}

                {!isPreview && (
                    <View style={styles.classBadges}>
                        <FlashcardClassBadges
                            mlStates={bundleWordsMLStates}
                            onBadgePress={setMasteryFilter}
                            onClassPress={setMasteryFilter}
                            onReviewWordsPress={() => setMasteryFilter('all')}
                        />
                    </View>
                )}

                {membership && (
                    <LibraryItem
                        description={t('bundle_details.show_in_main_collection_desc')}
                        enabled={membership.subscribed}
                        index={0}
                        label={t('bundle_details.show_in_main_collection')}
                        style={styles.subscribedToggle}
                        onPress={handleSubscribedToggle}
                    />
                )}

                <View style={styles.headerButtons} onLayout={handleHeaderButtonsLayout}>
                    {canAddWords && (
                        <ActionButton
                            label={t('bundle_details.add_word')}
                            style={styles.headerAddButton}
                            onPress={handleAddWordPress}
                        />
                    )}
                    {isPreview && (
                        <ActionButton
                            active={!isJoiningBundle && bundleWords.length > 0}
                            icon={'folder-multiple-plus-outline'}
                            iconFamily={'material-community'}
                            label={t('bundle_details.add_to_my_bundles')}
                            loading={isJoiningBundle}
                            style={styles.headerAddButton}
                            onPress={handleAddToMyBundlesPress}
                        />
                    )}
                    {!isPreview && !canAddWords && membership && (
                        <ActionButton
                            icon={'share-outline'}
                            label={t('bundle_details.share_bundle')}
                            style={styles.headerAddButton}
                            onPress={handleShareBundlePress}
                        />
                    )}
                    <ActionButton
                        primary
                        active={bundleWords.length > 0}
                        icon={'play'}
                        label={t('bundle_details.start_session')}
                        style={styles.headerStartButton}
                        onPress={handleStartSessionPress}
                    />
                </View>
            </Animated.View>
        ),
        [
            contentAppear,
            contentTitleOpacity,
            styles,
            bundle,
            isPreview,
            previewOwnerInfo,
            bundleWords.length,
            bundleWordsMLStates,
            flashcardsCount,
            membership,
            canAddWords,
            t,
            handleHeaderButtonsLayout,
            handleShareBundlePress,
        ],
    );

    const renderSubheader = useCallback(
        () => (
            <FlashcardsSubheader
                filterSheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
                masteryFilter={masteryFilter}
                showFilter={!isPreview}
                showSearch={false}
                sortingMethod={isPreview ? previewSortingMethod : flashcardsSortingMethod}
                sortingSheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
            />
        ),
        [masteryFilter, isPreview, previewSortingMethod, flashcardsSortingMethod],
    );

    const renderEmptyList = useCallback(() => {
        if (isBundleWordsFetching || !bundle) {
            return <FlashcardsSelectionSkeleton count={flashcardsCount || undefined} />;
        }

        return (
            <EmptyList
                title={t('no_items')}
                description={t(
                    masteryFilter !== 'all'
                        ? 'no_items_filter_desc'
                        : 'bundle_details.no_items_desc',
                )}
            />
        );
    }, [isBundleWordsFetching, bundle, flashcardsCount, masteryFilter, t]);

    const renderListItem = useCallback(
        ({ index, item }: { index: number; item: BundleListItem }) => {
            if (item.id === 'header') return renderHeader();
            if (item.id === 'subheader') return renderSubheader();
            if (item.id === 'empty') return renderEmptyList();
            return renderWordItem(item as BundleWord, index - 2);
        },
        [renderHeader, renderSubheader, renderEmptyList, renderWordItem],
    );

    const listData = useMemo<BundleListItem[]>(
        () => [
            { id: 'header' as const },
            { id: 'subheader' as const },
            ...(bundle && words.length > 0 ? words : [{ id: 'empty' as const }]),
        ],
        [bundle, words],
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
                isOwner={membership?.role === 'owner'}
                sheetName={BUNDLE_DETAILS_BUNDLE_OPTIONS_BOTTOM_SHEET}
                onBundleLeft={handleBundleLeft}
                onBundleRemoved={handleBundleRemoved}
            />
            <MicrophonePermissionBottomSheet
                sheetName={BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET}
            />
            <NewBundleBottomSheet
                sheetName={BUNDLE_DETAILS_NEW_BUNDLE_BOTTOM_SHEET}
                onAddWordsPress={handleNewBundleAddWordsPress}
            />
            <BundleAddedBottomSheet
                sheetName={BUNDLE_DETAILS_BUNDLE_ADDED_BOTTOM_SHEET}
                onStartSessionPress={handleBundleAddedStartSessionPress}
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
                ListFooterComponent={<View style={styles.listFooter} />}
                data={listData}
                keyExtractor={item => item.id}
                overScrollMode={'never'}
                ref={listRef}
                renderItem={renderListItem}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                stickyHeaderConfig={{ offset: TOP_BAR_HEIGHT }}
                stickyHeaderIndices={[1]}
                refreshControl={
                    <RefreshControl
                        progressViewOffset={TOP_BAR_HEIGHT}
                        refreshing={refreshing}
                        tintColor={colors.white}
                        onRefresh={handleRefresh}
                    />
                }
                onScroll={handleScroll}
            />
            <DockedActionPanel insets={insets} visible={isBottomPanelVisible}>
                <View style={styles.buttonsContainer}>
                    {canAddWords && (
                        <ActionButton
                            active={bundleWords.length > 0}
                            label={t('bundle_details.add_word')}
                            style={styles.button}
                            onPress={handleAddWordPress}
                        />
                    )}
                    {isPreview && (
                        <ActionButton
                            active={!isJoiningBundle && bundleWords.length > 0}
                            icon={'folder-multiple-plus-outline'}
                            iconFamily={'material-community'}
                            label={t('bundle_details.add_to_my_bundles')}
                            loading={isJoiningBundle}
                            style={styles.button}
                            onPress={handleAddToMyBundlesPress}
                        />
                    )}
                    {!isPreview && !canAddWords && membership && (
                        <ActionButton
                            icon={'share-outline'}
                            label={t('bundle_details.share_bundle')}
                            style={styles.button}
                            onPress={handleShareBundlePress}
                        />
                    )}
                    <ActionButton
                        primary
                        active={bundleWords.length > 0}
                        icon={'play'}
                        label={t('bundle_details.start_session')}
                        style={styles.button}
                        onPress={handleStartSessionPress}
                    />
                </View>
            </DockedActionPanel>
            <ScrollToTopButton
                addButtonAnim={bottomPanelOpacity}
                animatedValue={scrollToTopAnim}
                liftOffset={insets.bottom + 56}
                onPress={handleScrollToTop}
            />
            <BottomGradient />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        button: {
            flex: 1,
        },
        buttonsContainer: {
            flex: 1,
            flexDirection: 'row',
            gap: spacing.m,
        },
        classBadges: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        creatorInfo: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        headerAddButton: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        headerButtons: {
            marginTop: MARGIN_VERTICAL,
        },
        headerStartButton: {
            marginBottom: MARGIN_VERTICAL / 2,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        listFooter: {
            height: insets.bottom + MARGIN_VERTICAL / 2 + 56 + MARGIN_VERTICAL,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            height: '100%',
        },
        subscribedToggle: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        subtitle: {
            color: colors.white300,
            fontSize: 15,
            lineHeight: BUNDLE_SUBTITLE_LINE_HEIGHT,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        title: {
            color: colors.white,
            fontSize: 24,
            lineHeight: BUNDLE_TITLE_LINE_HEIGHT,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
    });
