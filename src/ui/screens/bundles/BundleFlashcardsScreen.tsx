import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import {
    BundleStackParamList,
    RootStackParamList,
    ScreenName,
} from '../../../navigation/navigationTypes';
import {
    useUserPreferences,
    useWords,
    useWordsBundle,
    useWordsMLStatesContext,
    useWordsWithDetails,
} from '../../../store';
import { WordWithDetails } from '../../../types';
import { isIOS } from '../../../utils/deviceUtils';
import { getSortingMethod } from '../../../utils/sortingUtil';
import { ActionButton, BottomGradient, CustomText } from '../../components';
import { EmptyList, FlashcardListItem, FlashcardsSubheader } from '../../components/flashcards';
import { BundleCreatorInfo, FlashcardClassBadges } from '../../components/home';
import { LibraryItem } from '../../components/library';
import {
    FLASHCARD_DETAIL_BOTTOM_SHEET,
    FlashcardDetailsBottomSheet,
} from '../../sheets/FlashcardDetailsBottomSheet';
import { HandleFlashcardBottomSheet } from '../../sheets/HandleFlashcardBottomSheet';
import { MasteryFilter, MasteryFilterBottomSheet } from '../../sheets/MasteryFilterBottomSheet';
import { MicrophonePermissionBottomSheet } from '../../sheets/MicrophonePermissionBottomSheet';
import { RemoveFlashcardBottomSheet } from '../../sheets/RemoveFlashcardBottomSheet';
import { SortingMethodBottomSheet } from '../../sheets/SortingMethodBottomSheet';
import {
    START_SESSION_BOTTOM_SHEET,
    StartSessionBottomSheet,
} from '../../sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../Theme';

const BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET = 'bundle-details-mastery-filter-bottom-sheet';
const BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET = 'bundle-details-sorting-method-bottom-sheet';
const BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET = 'bundle-details-handle-flashcard-bottom-sheet';
const BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET = 'bundle-details-microphone-permission';
const BUNDLE_DETAILS_REMOVE_FLASHCARD_BOTTOM_SHEET = 'bundle-details-remove-flashcard-bottom-sheet';
const DOCKED_HIDDEN_TRANSLATE_Y = 100;

type BundleFlashcardsScreenProps = NativeStackScreenProps<
    BundleStackParamList,
    ScreenName.BundleFlashcards
>;

export const BundleFlashcardsScreen = ({ route }: BundleFlashcardsScreenProps) => {
    const { bundleId } = route.params;
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    const { bundles, editBundleMember, syncBundles } = useWordsBundle();
    const { langWordsWithDetails } = useWordsWithDetails();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { flashcardsSortingMethod } = useUserPreferences();

    const { removeWord } = useWords();

    const TOP_BAR_HEIGHT = isIOS ? 44 + insets.top : insets.top + 56;

    const backScale = useRef(new Animated.Value(1)).current;
    const moreScale = useRef(new Animated.Value(1)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(12)).current;
    const scrollY = useRef(new Animated.Value(0)).current;

    const TITLE_SCROLL_START = 40;
    const TITLE_SCROLL_END = 80;

    const topBarTitleOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: [0, 1],
    });

    const topBarTitleTranslateY = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: [8, 0],
    });

    const contentTitleOpacity = scrollY.interpolate({
        extrapolate: 'clamp',
        inputRange: [TITLE_SCROLL_START, TITLE_SCROLL_END],
        outputRange: [1, 0],
    });

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollY.setValue(event.nativeEvent.contentOffset.y);
        },
        [scrollY],
    );

    useEffect(() => {
        Animated.parallel([
            Animated.timing(contentOpacity, {
                duration: 280,
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(contentTranslateY, {
                duration: 280,
                toValue: 0,
                useNativeDriver: true,
            }),
        ]).start();
    }, [contentOpacity, contentTranslateY]);

    const animatePressIn = (scale: Animated.Value) => {
        Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
    };

    const animatePressOut = (scale: Animated.Value) => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    const bundle = bundles.find(b => b.id === bundleId)!;
    const membership = bundle.membership;
    const canAddWords = membership?.role === 'owner' || membership?.role === 'editor';

    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
    const [editFlashcardId, setEditFlashcardId] = useState<string | undefined>(undefined);
    const [detailWord, setDetailWord] = useState<WordWithDetails | undefined>(undefined);
    const [refreshing, setRefreshing] = useState(false);
    const [startSessionButtonBottom, setStartSessionButtonBottom] = useState<number | undefined>(
        undefined,
    );
    const [isDockedStartSessionVisible, setIsDockedStartSessionVisible] = useState(false);

    const fabScale = useRef(new Animated.Value(1)).current;
    const addWordFabScale = useRef(new Animated.Value(1)).current;

    const dockedStartSessionTranslateY = useRef(
        new Animated.Value(DOCKED_HIDDEN_TRANSLATE_Y),
    ).current;
    const dockedStartSessionOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(dockedStartSessionTranslateY, {
                damping: 18,
                mass: 0.7,
                stiffness: 220,
                toValue: isDockedStartSessionVisible ? 0 : DOCKED_HIDDEN_TRANSLATE_Y,
                useNativeDriver: true,
            }),
            Animated.timing(dockedStartSessionOpacity, {
                duration: 220,
                toValue: isDockedStartSessionVisible ? 1 : 0,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isDockedStartSessionVisible, dockedStartSessionTranslateY, dockedStartSessionOpacity]);

    const handleStartSessionButtonLayout = useCallback((event: LayoutChangeEvent) => {
        const { height, y } = event.nativeEvent.layout;
        setStartSessionButtonBottom(y + height);
    }, []);

    useEffect(() => {
        const listenerId = scrollY.addListener(({ value }) => {
            if (startSessionButtonBottom === undefined) return;
            setIsDockedStartSessionVisible(value > startSessionButtonBottom - 120);
        });
        return () => scrollY.removeListener(listenerId);
    }, [scrollY, startSessionButtonBottom]);

    const bundleWords = useMemo(
        () => langWordsWithDetails.filter(word => word.bundleId === bundleId),
        [langWordsWithDetails, bundleId],
    );

    const bundleWordsMLStates = useMemo(() => {
        const bundleWordIds = new Set(bundleWords.map(word => word.id));
        return langWordsMLStates?.filter(state => bundleWordIds.has(state.wordId)) ?? [];
    }, [langWordsMLStates, bundleWords]);

    const matchesMasteryFilter = useCallback(
        (word: WordWithDetails) => {
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

    const words = useMemo(
        () =>
            bundleWords
                .filter(matchesMasteryFilter)
                .sort(getSortingMethod(flashcardsSortingMethod)),
        [bundleWords, matchesMasteryFilter, flashcardsSortingMethod],
    );

    const handleStartSessionPress = () => {
        TrueSheet.present(START_SESSION_BOTTOM_SHEET);
    };

    const handleAddWordPress = () => {
        Keyboard.dismiss();
        setEditFlashcardId(undefined);
        TrueSheet.present(BUNDLE_DETAILS_HANDLE_FLASHCARD_BOTTOM_SHEET);
    };

    const handleRefresh = useCallback(async () => {
        try {
            setRefreshing(true);

            await Promise.all([syncBundles(), new Promise(resolve => setTimeout(resolve, 3000))]);
        } finally {
            setRefreshing(false);
        }
    }, [syncBundles]);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleMoreOptionsPress = () => {
        // TODO: open bundle options menu once available
    };

    const handleSubscribedToggle = () => {
        if (!membership) return;
        editBundleMember({ id: membership.id, subscribed: !membership.subscribed });
    };

    const handleSessionStart = (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
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
            const word = bundleWords.find(w => w.id === id);
            if (!word) return;
            setDetailWord(word);
            TrueSheet.present(FLASHCARD_DETAIL_BOTTOM_SHEET);
        },
        [bundleWords],
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
        ({ gradeThreeProb, id, text, translation }: WordWithDetails) => (
            <FlashcardListItem
                id={id}
                level={gradeThreeProb}
                text={text}
                translation={translation}
                onPress={handlePress}
            />
        ),
        [handlePress],
    );

    const renderListItem = useCallback(
        ({ item }: { item: WordWithDetails | { id: 'header' } | { id: 'subheader' } }) => {
            if (item.id === 'header') return renderHeader();
            if (item.id === 'subheader') return renderSubheader();
            return renderWordItem(item as WordWithDetails);
        },
        [
            renderWordItem,
            bundle,
            bundleWords,
            bundleWordsMLStates,
            membership,
            canAddWords,
            masteryFilter,
            flashcardsSortingMethod,
        ],
    );

    const listData = useMemo(
        () => [{ id: 'header' as const }, { id: 'subheader' as const }, ...words],
        [words],
    );

    const renderHeader = () => (
        <Animated.View
            style={{
                opacity: contentOpacity,
                transform: [{ translateY: contentTranslateY }],
            }}
        >
            <Animated.View style={{ opacity: contentTitleOpacity }}>
                <CustomText style={styles.title} weight="Bold">
                    {bundle?.title ?? ''}
                </CustomText>
            </Animated.View>
            {bundle?.description && (
                <CustomText style={styles.subtitle}>{bundle.description}</CustomText>
            )}

            <BundleCreatorInfo
                creatorId={bundle.ownerId}
                flashcardsCount={bundleWords.length}
                style={styles.creatorInfo}
            />

            <View style={styles.classBadges}>
                <FlashcardClassBadges
                    mlStates={bundleWordsMLStates}
                    onBadgePress={setMasteryFilter}
                    onClassPress={setMasteryFilter}
                    onReviewWordsPress={() => setMasteryFilter('all')}
                />
            </View>

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

            {canAddWords && (
                <ActionButton
                    label={t('bundle_details.add_word')}
                    style={styles.addWordButton}
                    onPress={handleAddWordPress}
                />
            )}

            <View onLayout={handleStartSessionButtonLayout}>
                <ActionButton
                    primary
                    icon={'play'}
                    label={t('bundle_details.start_session')}
                    style={styles.startSessionButton}
                    onPress={handleStartSessionPress}
                />
            </View>
        </Animated.View>
    );

    const renderSubheader = () => (
        <FlashcardsSubheader
            filterSheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
            masteryFilter={masteryFilter}
            showSearch={false}
            sortingMethod={flashcardsSortingMethod}
            sortingSheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
        />
    );

    const renderEmptyList = () => (
        <EmptyList
            description={t(masteryFilter !== 'all' ? 'no_items_filter_desc' : 'no_items_desc')}
            title={t('no_items')}
        />
    );

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer}>
                <Pressable
                    hitSlop={12}
                    style={styles.backButton}
                    onPress={handleBackPress}
                    onPressIn={() => animatePressIn(backScale)}
                    onPressOut={() => animatePressOut(backScale)}
                >
                    <Animated.View style={{ transform: [{ scale: backScale }] }}>
                        <Ionicons color={colors.white} name="chevron-back" size={26} />
                    </Animated.View>
                </Pressable>
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.topBarTitleContainer,
                        {
                            opacity: topBarTitleOpacity,
                            transform: [{ translateY: topBarTitleTranslateY }],
                        },
                    ]}
                >
                    <CustomText numberOfLines={1} style={styles.topBarTitle} weight="Bold">
                        {bundle?.title ?? ''}
                    </CustomText>
                </Animated.View>
                <Pressable
                    hitSlop={12}
                    style={styles.moreButton}
                    onPress={handleMoreOptionsPress}
                    onPressIn={() => animatePressIn(moreScale)}
                    onPressOut={() => animatePressOut(moreScale)}
                >
                    <Animated.View style={{ transform: [{ scale: moreScale }] }}>
                        <Ionicons color={colors.white} name="ellipsis-horizontal" size={22} />
                    </Animated.View>
                </Pressable>
            </View>
            <StartSessionBottomSheet onSessionStart={handleSessionStart} />
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
            <MicrophonePermissionBottomSheet
                sheetName={BUNDLE_DETAILS_MICROPHONE_PERMISSION_SHEET}
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
            <SortingMethodBottomSheet sheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET} />
            <FlashList
                ListEmptyComponent={renderEmptyList}
                ListFooterComponent={<View style={{ height: 16 }} />}
                data={listData}
                keyExtractor={item => item.id}
                overScrollMode={'never'}
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
            <Animated.View
                pointerEvents={isDockedStartSessionVisible ? 'box-none' : 'none'}
                style={[
                    styles.fabWrapper,
                    {
                        opacity: dockedStartSessionOpacity,
                        transform: [
                            { scale: fabScale },
                            { translateY: dockedStartSessionTranslateY },
                        ],
                    },
                ]}
            >
                <Pressable
                    style={styles.fab}
                    onPress={handleStartSessionPress}
                    onPressIn={() => animatePressIn(fabScale)}
                    onPressOut={() => animatePressOut(fabScale)}
                >
                    <Ionicons color={colors.white} name="play" size={18} />
                </Pressable>
            </Animated.View>
            {canAddWords && (
                <Animated.View
                    pointerEvents={isDockedStartSessionVisible ? 'box-none' : 'none'}
                    style={[
                        styles.addWordFabWrapper,
                        {
                            opacity: dockedStartSessionOpacity,
                            transform: [
                                { scale: addWordFabScale },
                                { translateY: dockedStartSessionTranslateY },
                            ],
                        },
                    ]}
                >
                    <Pressable
                        style={styles.addWordFab}
                        onPress={handleAddWordPress}
                        onPressIn={() => animatePressIn(addWordFabScale)}
                        onPressOut={() => animatePressOut(addWordFabScale)}
                    >
                        <Ionicons color={colors.white} name="add" size={22} />
                    </Pressable>
                </Animated.View>
            )}
            <BottomGradient />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        addWordButton: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        addWordFab: {
            alignItems: 'center',
            backgroundColor: colors.background,
            borderColor: colors.cardAccent300,
            borderRadius: 20,
            borderWidth: 1.5,
            elevation: 4,
            height: 40,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { height: 2, width: 0 },
            shadowRadius: 6,
            width: 40,
        },
        addWordFabWrapper: {
            bottom: insets.bottom + 24 + 56 + 8,
            position: 'absolute',
            right: MARGIN_HORIZONTAL + 8,
            zIndex: 30,
        },
        backButton: {
            marginLeft: MARGIN_HORIZONTAL,
        },
        classBadges: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        creatorInfo: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        fab: {
            alignItems: 'center',
            backgroundColor: colors.primary,
            borderColor: colors.card,
            borderRadius: 28,
            elevation: 4,
            height: 56,
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { height: 2, width: 0 },
            shadowRadius: 6,
            width: 56,
        },
        fabWrapper: {
            bottom: insets.bottom + 24,
            position: 'absolute',
            right: MARGIN_HORIZONTAL,
            zIndex: 30,
        },
        moreButton: {
            marginRight: MARGIN_HORIZONTAL,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            height: '100%',
        },
        startSessionButton: {
            marginBottom: MARGIN_VERTICAL / 2,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        subscribedToggle: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        subtitle: {
            color: colors.white300,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 3,
        },
        title: {
            color: colors.white,
            fontSize: 24,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        topBarTitle: {
            color: colors.white,
            fontSize: 17,
        },
        topBarTitleContainer: {
            alignItems: 'center',
            bottom: 0,
            justifyContent: 'center',
            left: 56,
            position: 'absolute',
            right: 56,
            top: insets.top,
        },
        topSpacer: {
            alignItems: 'center',
            backgroundColor: colors.background,
            flexDirection: 'row',
            height: isIOS ? 44 + insets.top : insets.top + 56,
            justifyContent: 'space-between',
            left: 0,
            paddingTop: insets.top,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 20,
        },
    });
