import { FC, useCallback, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import { RootStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { useWordsBundle } from '../../../store';
import { EnrichedWordsBundle } from '../../../store/WordsBundleContext';
import { ThemeColors, WordsBundle } from '../../../types';
import { ActionButton, BottomGradient, DockedActionPanel } from '../../../ui/components';
import { EmptyList, ListFilter, ScrollToTopButton } from '../../../ui/components/flashcards';
import { StartSessionBottomSheet } from '../../../ui/sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../../ui/Theme';
import { isIOS } from '../../../utils/deviceUtils';
import { normalizeForSearch } from '../../../utils/helpers';
import { ScrollableTopBar } from '../common/components';
import { ANDROID_HEIGHT, IOS_HEIGHT } from '../common/constants';
import { HandleBundleBottomSheet, JoinBundleWithCodeBottomSheet } from '../common/sheets';
import { BundleListItem } from '../dashboard/components';
import { AddBundleBottomSheet } from '../dashboard/sheets';
import { BundleMembersTitleSection } from '../members/components';
import {
    MEMBERS_DOCKED_ACTION_PANEL_HEIGHT,
    MEMBERS_LIST_BOTTOM_SPACING,
} from '../members/constants';
import { useMembersScrollAnimation } from '../members/hooks';
import {
    ALL_BUNDLES_ADD_BUNDLE_SHEET_NAME,
    ALL_BUNDLES_HANDLE_BUNDLE_SHEET_NAME,
    ALL_BUNDLES_JOIN_WITH_CODE_SHEET_NAME,
    ALL_BUNDLES_START_SESSION_SHEET_NAME,
} from './constants';

type AllBundlesScreenNavProp = NativeStackNavigationProp<RootStackParamList>;

interface AllBundlesScreenProps {
    navigation: AllBundlesScreenNavProp;
}

const keyExtractor = (item: EnrichedWordsBundle) => item.id;

const AnimatedFlatList = Animated.FlatList<EnrichedWordsBundle>;

const EmptyBundlesList = (
    <EmptyList descriptionTx="bundles.no_bundles_desc" titleTx="bundles.no_bundles" />
);

const EmptySearchList = (
    <EmptyList descriptionTx="bundles.empty_search_desc" titleTx="bundles.empty_search" />
);

const matchesQuery = (bundle: EnrichedWordsBundle, normalizedQuery: string) =>
    normalizeForSearch(bundle.title).includes(normalizedQuery) ||
    (!!bundle.description && normalizeForSearch(bundle.description).includes(normalizedQuery));

export const AllBundlesScreen: FC<AllBundlesScreenProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme() as CustomTheme;
    const topBarHeight = insets.top + (isIOS ? IOS_HEIGHT : ANDROID_HEIGHT);
    const styles = useMemo(
        () => getStyles(colors, topBarHeight, insets.bottom),
        [colors, topBarHeight, insets.bottom],
    );
    const { langBundles, touchBundleInteraction } = useWordsBundle();

    const [sessionBundleId, setSessionBundleId] = useState<string>();
    const [query, setQuery] = useState('');

    // Same scroll behavior as the members screen: scroll-to-top button, and the docked
    // "add bundle" panel once the header button scrolls out of view.
    const {
        bottomPanelOpacity,
        handleHeaderButtonLayout,
        handleScroll,
        handleScrollToTop,
        isBottomPanelVisible,
        listRef,
        scrollToTopAnim,
        scrollY,
    } = useMembersScrollAnimation<EnrichedWordsBundle>();

    const normalizedQuery = normalizeForSearch(query.trim());
    const filteredBundles = useMemo(
        () =>
            normalizedQuery
                ? langBundles.filter(bundle => matchesQuery(bundle, normalizedQuery))
                : langBundles,
        [langBundles, normalizedQuery],
    );

    const handleAddNewPress = () => {
        TrueSheet.present(ALL_BUNDLES_ADD_BUNDLE_SHEET_NAME);
    };

    const handleCreateNewBundle = () => {
        TrueSheet.present(ALL_BUNDLES_HANDLE_BUNDLE_SHEET_NAME);
    };

    const handleBundleCreated = (bundle: WordsBundle) => {
        navigation.navigate(ScreenName.BundleNavigator, {
            bundleId: bundle.id,
            isNewBundle: true,
        });
    };

    const handleJoinBundleWithCodePress = () => {
        TrueSheet.present(ALL_BUNDLES_JOIN_WITH_CODE_SHEET_NAME);
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
        TrueSheet.present(ALL_BUNDLES_START_SESSION_SHEET_NAME);
    }, []);

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
            bundle={item}
            index={index}
            style={index === 0 ? styles.firstBundle : undefined}
            onPlayPress={handleBundlePlayPress}
            onPress={handleBundlePress}
        />
    );

    const listHeader = (
        <View>
            <BundleMembersTitleSection
                descriptionTx="bundles.your_bundles_desc"
                titleTx="bundles.your_bundles"
            />
            <View onLayout={handleHeaderButtonLayout}>
                <ActionButton
                    primary
                    labelTx="bundles.add_new"
                    style={styles.addButton}
                    onPress={handleAddNewPress}
                />
            </View>
            <ListFilter
                isSearching={!!query}
                placeholderTx="bundles.search_your_bundles"
                styleRoot={styles.searchFilter}
                value={query}
                onChangeText={setQuery}
                onClear={() => setQuery('')}
            />
        </View>
    );

    return (
        <View style={styles.root}>
            <ScrollableTopBar
                insets={insets}
                scrollY={scrollY}
                titleTx="bundles.your_bundles"
                onBackPress={navigation.goBack}
            />
            <AnimatedFlatList
                ListEmptyComponent={normalizedQuery ? EmptySearchList : EmptyBundlesList}
                ListHeaderComponent={listHeader}
                contentContainerStyle={styles.list}
                data={filteredBundles}
                keyExtractor={keyExtractor}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"
                ref={listRef}
                renderItem={renderBundleItem}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
                onScroll={handleScroll}
            />
            <ScrollToTopButton
                addButtonAnim={bottomPanelOpacity}
                animatedValue={scrollToTopAnim}
                liftOffset={insets.bottom + MEMBERS_DOCKED_ACTION_PANEL_HEIGHT}
                onPress={handleScrollToTop}
            />
            <DockedActionPanel visible={isBottomPanelVisible}>
                <ActionButton primary labelTx="bundles.add_new" onPress={handleAddNewPress} />
            </DockedActionPanel>
            <StartSessionBottomSheet
                sheetName={ALL_BUNDLES_START_SESSION_SHEET_NAME}
                onSessionStart={handleSessionStart}
            />
            <AddBundleBottomSheet
                sheetName={ALL_BUNDLES_ADD_BUNDLE_SHEET_NAME}
                onCreateNew={handleCreateNewBundle}
                onJoinWithCode={handleJoinBundleWithCodePress}
            />
            <HandleBundleBottomSheet
                sheetName={ALL_BUNDLES_HANDLE_BUNDLE_SHEET_NAME}
                onBundleCreated={handleBundleCreated}
            />
            <JoinBundleWithCodeBottomSheet
                sheetName={ALL_BUNDLES_JOIN_WITH_CODE_SHEET_NAME}
                onJoined={handleJoinedBundleWithCode}
            />
            <BottomGradient />
        </View>
    );
};

const getStyles = (colors: ThemeColors, topBarHeight: number, insetsBottom: number) =>
    StyleSheet.create({
        addButton: {
            marginBottom: spacing.xl,
            marginTop: spacing.xl,
        },
        // Matches the gap above the first member on the members screen (the shared bundle card
        // drops its top margin for index 0).
        firstBundle: {
            marginTop: spacing.m,
        },
        // Offset the list itself (not its content) below the top bar, so the header button's
        // measured position matches the scroll offset used to show the docked panel.
        flatList: {
            marginTop: topBarHeight,
        },
        list: {
            paddingBottom:
                insetsBottom + MEMBERS_DOCKED_ACTION_PANEL_HEIGHT + MEMBERS_LIST_BOTTOM_SPACING,
            paddingHorizontal: MARGIN_HORIZONTAL,
        },
        root: {
            backgroundColor: colors.background,
            flex: 1,
        },
        searchFilter: {
            marginBottom: spacing.l,
            marginTop: spacing.m,
        },
    });
