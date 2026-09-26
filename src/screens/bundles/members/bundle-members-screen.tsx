import { useMemo, useState } from 'react';
import { Animated, RefreshControl, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { BundleStackParamList, ScreenName } from '../../../navigation/navigationTypes';
import { useAuth, useWordsBundle } from '../../../store';
import { ThemeColors } from '../../../types';
import { ActionButton, BottomGradient, DockedActionPanel } from '../../../ui/components';
import { EmptyList, ListFilter, ScrollToTopButton } from '../../../ui/components/flashcards';
import { CustomTheme } from '../../../ui/Theme';
import { isIOS } from '../../../utils/deviceUtils';
import { ScrollableTopBar } from '../common/components';
import { ANDROID_HEIGHT, IOS_HEIGHT } from '../common/constants';
import { useShareBundleLink } from '../common/hooks';
import { ShareBundleBottomSheet } from '../common/sheets';
import { BundleMemberListItem, BundleMembersTitleSection, MembersListSkeleton } from './components';
import {
    MEMBER_ACTIONS_BOTTOM_SHEET,
    MEMBERS_DOCKED_ACTION_PANEL_HEIGHT,
    MEMBERS_LIST_BOTTOM_SPACING,
    REMOVE_MEMBER_BOTTOM_SHEET,
    SHARE_BUNDLE_BOTTOM_SHEET,
    TRANSFER_OWNERSHIP_BOTTOM_SHEET,
} from './constants';
import { useBundleMembersActions, useBundleMembersQuery, useMembersScrollAnimation } from './hooks';
import {
    MemberActionsBottomSheet,
    RemoveMemberBottomSheet,
    TransferOwnershipBottomSheet,
} from './sheets';
import { MembersListRow } from './types';
import { filterAndSortMembers } from './utils';

type BundleMembersScreenProps = NativeStackScreenProps<
    BundleStackParamList,
    ScreenName.BundleMembers
>;

const keyExtractor = (item: MembersListRow) => (item.type === 'member' ? item.member.id : item.id);

const AnimatedFlatList = Animated.FlatList<MembersListRow>;

export const BundleMembersScreen = ({ navigation, route }: BundleMembersScreenProps) => {
    const { bundleId, previewTitle } = route.params;
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const topBarHeight = insets.top + (isIOS ? IOS_HEIGHT : ANDROID_HEIGHT);
    const styles = useMemo(
        () => getStyles(colors, topBarHeight, insets.bottom),
        [colors, topBarHeight, insets.bottom],
    );
    const { shareBundleLink } = useShareBundleLink();
    const { user } = useAuth();
    const { bundles } = useWordsBundle();
    const bundle = bundles.find(b => b.id === bundleId);
    const isBundleOwner = bundle?.membership?.role === 'owner';

    const [query, setQuery] = useState('');

    const { data: members = [], isFetching, isLoading, refetch } = useBundleMembersQuery(bundleId);
    const {
        bottomPanelOpacity,
        handleHeaderButtonLayout,
        handleScroll,
        handleScrollToTop,
        isBottomPanelVisible,
        listRef,
        scrollToTopAnim,
        scrollY,
    } = useMembersScrollAnimation<MembersListRow>();

    const {
        handleGrantEdit,
        handleMemberActionsPress,
        handleRemove,
        handleRemoveCancel,
        handleRemoved,
        handleRevokeEdit,
        handleTransferCancel,
        handleTransferOwnership,
        handleTransferred,
        selectedMember,
    } = useBundleMembersActions(bundleId);

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleShareBundleLinkPress = () => {
        const title = bundle?.title ?? previewTitle;
        if (!bundleId || !title) return;

        shareBundleLink(bundleId, title);
    };

    const handleShareBundlePress = () => {
        if (isBundleOwner) {
            TrueSheet.present(SHARE_BUNDLE_BOTTOM_SHEET);
            return;
        }
        handleShareBundleLinkPress();
    };

    const handleQueryClear = () => {
        setQuery('');
    };

    const trimmedQuery = query.trim();
    const filteredMembers = useMemo(() => filterAndSortMembers(members, query), [members, query]);

    const getContentRows = (): MembersListRow[] => {
        if (isLoading) return [{ id: 'skeleton', type: 'skeleton' }];
        if (filteredMembers.length === 0) return [{ id: 'emptyList', type: 'emptyList' }];

        return filteredMembers.map((member, index) => ({
            isFirst: index === 0,
            member,
            type: 'member',
        }));
    };

    const rows: MembersListRow[] = [
        { id: 'header', type: 'header' },
        { id: 'filter', type: 'filter' },
        ...getContentRows(),
    ];

    const shareButtonLabelTx = isBundleOwner
        ? 'bundle_details.share_bundle'
        : 'bundle_details.options.share_bundle_link';
    const membersDescriptionTx = isBundleOwner
        ? 'bundle_details.members.desc'
        : 'bundle_details.members.desc_readonly';

    const renderHeaderRow = () => (
        <>
            <BundleMembersTitleSection
                descriptionTx={membersDescriptionTx}
                titleTx="bundle_details.members.title"
            />
            <View onLayout={handleHeaderButtonLayout}>
                <ActionButton
                    primary
                    icon="share-outline"
                    labelTx={shareButtonLabelTx}
                    style={styles.shareButton}
                    onPress={handleShareBundlePress}
                />
            </View>
        </>
    );

    const renderFilterRow = () => (
        <View style={styles.stickyFilterWrapper}>
            <ListFilter
                isSearching
                placeholderTx="bundle_details.members.search_placeholder"
                styleRoot={styles.searchFilter}
                value={query}
                onChangeText={setQuery}
                onClear={handleQueryClear}
            />
        </View>
    );

    const renderEmptyListRow = () => (
        <EmptyList
            titleTx="bundle_details.members.title"
            descriptionTx={
                trimmedQuery ? 'bundle_details.members.no_results' : 'bundle_details.no_members'
            }
        />
    );

    const renderItem = ({ item }: { item: MembersListRow }) => {
        switch (item.type) {
            case 'header':
                return renderHeaderRow();
            case 'filter':
                return renderFilterRow();
            case 'emptyList':
                return renderEmptyListRow();
            case 'skeleton':
                return <MembersListSkeleton />;
            case 'member':
                return (
                    <BundleMemberListItem
                        isCurrentUser={item.member.userId === user?.userId}
                        isFirst={item.isFirst}
                        member={item.member}
                        onActionsPress={isBundleOwner ? handleMemberActionsPress : undefined}
                    />
                );
        }
    };

    const renderRefreshControl = () => (
        <RefreshControl refreshing={isFetching} tintColor={colors.white} onRefresh={refetch} />
    );

    return (
        <View style={styles.root}>
            <ScrollableTopBar
                insets={insets}
                scrollY={scrollY}
                titleTx="bundle_details.members.title"
                onBackPress={handleBackPress}
            />
            <AnimatedFlatList
                contentContainerStyle={styles.list}
                data={rows}
                keyExtractor={keyExtractor}
                ref={listRef}
                refreshControl={renderRefreshControl()}
                renderItem={renderItem}
                scrollEventThrottle={16}
                stickyHeaderIndices={[1]}
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
                <ActionButton
                    primary
                    icon="share-outline"
                    labelTx={shareButtonLabelTx}
                    onPress={handleShareBundlePress}
                />
            </DockedActionPanel>
            <MemberActionsBottomSheet
                member={selectedMember}
                sheetName={MEMBER_ACTIONS_BOTTOM_SHEET}
                onGrantEdit={handleGrantEdit}
                onRevokeEdit={handleRevokeEdit}
            />
            <TransferOwnershipBottomSheet
                member={selectedMember}
                sheetName={TRANSFER_OWNERSHIP_BOTTOM_SHEET}
                onCancel={handleTransferCancel}
                onTransfer={handleTransferOwnership}
                onTransferred={handleTransferred}
            />
            <RemoveMemberBottomSheet
                isPublic={bundle?.visibility !== 'private'}
                member={selectedMember}
                sheetName={REMOVE_MEMBER_BOTTOM_SHEET}
                onCancel={handleRemoveCancel}
                onRemove={handleRemove}
                onRemoved={handleRemoved}
            />
            <ShareBundleBottomSheet
                bundleId={bundleId}
                bundleTitle={bundle?.title}
                isPublic={bundle?.visibility !== 'private'}
                sheetName={SHARE_BUNDLE_BOTTOM_SHEET}
            />
            <BottomGradient />
        </View>
    );
};

const getStyles = (colors: ThemeColors, topBarHeight: number, insetsBottom: number) =>
    StyleSheet.create({
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
        },
        shareButton: {
            marginBottom: spacing.xl,
            marginTop: spacing.xl,
        },
        stickyFilterWrapper: {
            backgroundColor: colors.background,
            marginHorizontal: -MARGIN_HORIZONTAL,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: spacing.m,
        },
    });
