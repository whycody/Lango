import { useCallback, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { SessionMode } from '../../constants/Session';
import { FlashcardSide, SessionLength } from '../../constants/UserPreferences';
import { RootStackParamList, ScreenName } from '../../navigation/navigationTypes';
import {
    useAuth,
    useUserPreferences,
    useWordsBundle,
    useWordsMLStatesContext,
    useWordsWithDetails,
} from '../../store';
import { WordWithDetails } from '../../types';
import { getSortingMethod } from '../../utils/sortingUtil';
import { ActionButton, CustomText } from '../components';
import {
    EmptyList,
    FlashcardListItem,
    FlashcardsSubheader,
    ListFilter,
} from '../components/flashcards';
import { FlashcardClassBadges } from '../components/home';
import { LibraryItem } from '../components/library';
import { MasteryFilter, MasteryFilterBottomSheet } from '../sheets/MasteryFilterBottomSheet';
import { SortingMethodBottomSheet } from '../sheets/SortingMethodBottomSheet';
import {
    START_SESSION_BOTTOM_SHEET,
    StartSessionBottomSheet,
} from '../sheets/StartSessionBottomSheet';
import { CustomTheme } from '../Theme';

const BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET = 'bundle-details-mastery-filter-bottom-sheet';
const BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET = 'bundle-details-sorting-method-bottom-sheet';

type BundleDetailsScreenProps = NativeStackScreenProps<
    RootStackParamList,
    ScreenName.BundleDetails
>;

export const BundleDetailsScreen = ({ route }: BundleDetailsScreenProps) => {
    const { bundleId } = route.params;
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    const { user } = useAuth();
    const { bundles, editBundleMember, members } = useWordsBundle();
    const { langWordsWithDetails } = useWordsWithDetails();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { flashcardsSortingMethod } = useUserPreferences();

    const bundle = bundles.find(b => b.id === bundleId);
    const membership = members.find(
        member => member.bundleId === bundleId && member.userId === user?.userId,
    );

    const [filter, setFilter] = useState('');
    const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>('all');
    const [searchingMode, setSearchingMode] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const listRef = useRef<FlashListRef<{ id: string }>>(null);

    const bundleWords = useMemo(
        () => langWordsWithDetails.filter(word => word.bundleId === bundleId),
        [langWordsWithDetails, bundleId],
    );

    const bundleWordsMLStates = useMemo(() => {
        const bundleWordIds = new Set(bundleWords.map(word => word.id));
        return langWordsMLStates?.filter(state => bundleWordIds.has(state.wordId)) ?? [];
    }, [langWordsMLStates, bundleWords]);

    const matchesSearchQuery = useCallback(
        (word: WordWithDetails) => {
            const query = filter.trim().toLowerCase();
            if (!query) return false;
            return (
                word.text.trim().toLowerCase().includes(query) ||
                word.translation.trim().toLowerCase().includes(query)
            );
        },
        [filter],
    );

    const matchesMasteryFilter = useCallback(
        (word: WordWithDetails) => {
            if (masteryFilter === 'all') return true;
            if (masteryFilter === 'learning') return word.gradeThreeProb <= 0.33;
            if (masteryFilter === 'review')
                return word.gradeThreeProb > 0.33 && word.gradeThreeProb < 0.66;
            if (masteryFilter === 'mastered') return word.gradeThreeProb >= 0.66;
            return true;
        },
        [masteryFilter],
    );

    const words = useMemo(
        () =>
            bundleWords
                .filter(word =>
                    searchingMode ? matchesSearchQuery(word) : matchesMasteryFilter(word),
                )
                .sort(getSortingMethod(flashcardsSortingMethod)),
        [
            bundleWords,
            searchingMode,
            matchesSearchQuery,
            matchesMasteryFilter,
            flashcardsSortingMethod,
        ],
    );

    const turnOffSearchingMode = () => {
        inputRef.current?.blur();
        Keyboard.dismiss();
        setFilter('');
        setSearchingMode(false);
        listRef.current?.scrollToOffset({ animated: false, offset: 0 });
    };

    const turnOnSearchingMode = () => {
        setSearchingMode(true);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSubscribedToggle = () => {
        if (!membership) return;
        editBundleMember({ id: membership.id, subscribed: !membership.subscribed });
    };

    const handleStartSessionPress = () => {
        TrueSheet.present(START_SESSION_BOTTOM_SHEET);
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

    const renderWordItem = useCallback(
        ({ gradeThreeProb, id, text, translation }: WordWithDetails) => (
            <FlashcardListItem
                id={id}
                level={gradeThreeProb}
                text={text}
                translation={translation}
            />
        ),
        [],
    );

    const renderHeader = useMemo(
        () => (
            <View style={styles.headerContainer}>
                <CustomText style={styles.title} weight="Bold">
                    {bundle?.title ?? ''}
                </CustomText>
                {bundle?.description && (
                    <CustomText style={styles.subtitle}>{bundle.description}</CustomText>
                )}

                <View style={styles.classBadges}>
                    <FlashcardClassBadges
                        mlStates={bundleWordsMLStates}
                        onBadgePress={setMasteryFilter}
                        onClassPress={setMasteryFilter}
                        onReviewWordsPress={() => setMasteryFilter('all')}
                    />
                </View>

                <ActionButton
                    primary
                    icon={'play'}
                    label={t('bundle_details.start_session')}
                    style={styles.startSessionButton}
                    onPress={handleStartSessionPress}
                />

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
            </View>
        ),
        [bundle, membership, styles, t],
    );

    const renderSubheader = useMemo(
        () => (
            <FlashcardsSubheader
                filterSheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
                masteryFilter={masteryFilter}
                sortingMethod={flashcardsSortingMethod}
                sortingSheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET}
                onClearSearch={() => setFilter('')}
                onSearchPress={turnOnSearchingMode}
            />
        ),
        [flashcardsSortingMethod, masteryFilter],
    );

    const renderEmptyList = useMemo(
        () => (
            <EmptyList
                title={t(searchingMode ? 'empty_search' : 'no_items')}
                description={t(
                    searchingMode
                        ? filter
                            ? 'empty_search_desc'
                            : 'start_search_desc'
                        : masteryFilter !== 'all'
                          ? 'no_items_filter_desc'
                          : 'no_items_desc',
                )}
            />
        ),
        [searchingMode, filter, masteryFilter, t],
    );

    const renderSearchHeader = useMemo(
        () => (
            <View style={[styles.row, styles.searchHeaderContainer]}>
                <Ionicons
                    color={colors.white300}
                    name={'arrow-back-sharp'}
                    size={24}
                    style={styles.backIcon}
                    onPress={turnOffSearchingMode}
                />
                <ListFilter
                    isSearching={searchingMode}
                    ref={inputRef}
                    value={filter}
                    onChangeText={setFilter}
                    onClear={() => setFilter('')}
                    onFocus={searchingMode ? undefined : turnOnSearchingMode}
                />
            </View>
        ),
        [filter, searchingMode],
    );

    const renderListItem = ({ item }: { item: { id: string } }) => {
        if (item.id === 'header') return renderHeader;
        if (item.id === 'subheader') return renderSubheader;
        if (item.id === 'emptyList') return renderEmptyList;
        return renderWordItem(item as WordWithDetails);
    };

    const data = searchingMode
        ? [...(words.length === 0 ? [{ id: 'emptyList' }] : []), ...words]
        : [
              { id: 'header' },
              { id: 'subheader' },
              ...(words.length === 0 ? [{ id: 'emptyList' }] : []),
              ...words,
          ];

    return (
        <View style={styles.root}>
            <View style={styles.topSpacer} />
            <StartSessionBottomSheet onSessionStart={handleSessionStart} />
            <MasteryFilterBottomSheet
                sheetName={BUNDLE_DETAILS_MASTERY_FILTER_BOTTOM_SHEET}
                value={masteryFilter}
                onChange={setMasteryFilter}
            />
            <SortingMethodBottomSheet sheetName={BUNDLE_DETAILS_SORTING_METHOD_BOTTOM_SHEET} />
            {searchingMode && renderSearchHeader}
            <FlashList
                key={searchingMode ? 'search' : 'normal'}
                ListFooterComponent={<View style={{ height: 16 }} />}
                data={data}
                keyExtractor={item => item.id}
                keyboardDismissMode={'on-drag'}
                keyboardShouldPersistTaps={'always'}
                overScrollMode={'never'}
                ref={listRef}
                renderItem={renderListItem}
                showsVerticalScrollIndicator={false}
                stickyHeaderHiddenOnScroll={false}
                stickyHeaderIndices={searchingMode || !words.length ? undefined : [1]}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        backIcon: {
            marginRight: 10,
        },
        classBadges: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        headerContainer: {
            backgroundColor: colors.background,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
            height: '100%',
        },
        row: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        searchHeaderContainer: {
            backgroundColor: colors.background,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        startSessionButton: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        subscribedToggle: {
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
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
        topSpacer: {
            height: insets.top,
        },
    });
