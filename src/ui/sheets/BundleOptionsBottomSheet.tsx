import { Share, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../constants/margins';
import { palette } from '../../constants/palette';
import { useWords, useWordsBundle } from '../../store';
import { LibraryItem } from '../components/library';
import { GenericBottomSheet } from './GenericBottomSheet';
import { HandleBundleBottomSheet } from './HandleBundleBottomSheet';
import { LeaveBundleBottomSheet } from './LeaveBundleBottomSheet';
import { RemoveBundleBottomSheet } from './RemoveBundleBottomSheet';
import { ShareBundleBottomSheet } from './ShareBundleBottomSheet';
import { VisibilityBottomSheet } from './VisibilityBottomSheet';

const EDIT_BUNDLE_SHEET_NAME = 'bundle-options-edit-bundle-sheet';
const VISIBILITY_SHEET_NAME = 'bundle-options-visibility-sheet';
const REMOVE_BUNDLE_SHEET_NAME = 'bundle-options-remove-bundle-sheet';
const LEAVE_BUNDLE_SHEET_NAME = 'bundle-options-leave-bundle-sheet';
const SHARE_BUNDLE_SHEET_NAME = 'bundle-options-share-bundle-sheet';

type BundleOptionsBottomSheetProps = {
    bundleId?: string;
    isOwner: boolean;
    sheetName: string;
    onBundleRemoved: () => void;
    onBundleLeft: () => void;
};

export const BundleOptionsBottomSheet = ({
    bundleId,
    isOwner,
    onBundleLeft,
    onBundleRemoved,
    sheetName,
}: BundleOptionsBottomSheetProps) => {
    const { bundles, editBundleMember, removeBundle } = useWordsBundle();
    const { i18n, t } = useTranslation();
    const queryClient = useQueryClient();

    const { langWords } = useWords();
    const bundle = bundles.find(b => b.id === bundleId);
    const membership = bundle?.membership;

    const handleEditPress = () => {
        TrueSheet.present(EDIT_BUNDLE_SHEET_NAME);
    };

    const handleVisibilityPress = () => {
        TrueSheet.present(VISIBILITY_SHEET_NAME);
    };

    const handleDeletePress = () => {
        TrueSheet.present(REMOVE_BUNDLE_SHEET_NAME);
    };

    const handleLeavePress = () => {
        TrueSheet.present(LEAVE_BUNDLE_SHEET_NAME);
    };

    const handleSharePress = () => {
        TrueSheet.present(SHARE_BUNDLE_SHEET_NAME);
    };

    const handleShareBundleLinkPress = () => {
        if (!bundleId || !bundle) return;

        Share.share({
            message: t('bundle_details.share_sheet.share_bundle_link_message', {
                link: `${process.env.SITE_URL}/bundle/${bundleId}?lang=${i18n.language}`,
                title: bundle.title,
            }),
        });
    };

    const handleRemoveCancel = () => {
        TrueSheet.dismiss(REMOVE_BUNDLE_SHEET_NAME);
    };

    const handleRemoveConfirm = async () => {
        if (!bundleId) return { errorCode: 'unknown' as const, success: false as const };
        const result = await removeBundle(bundleId);
        if (!result.success) return result;

        TrueSheet.dismissAll();
        onBundleRemoved();
        return result;
    };

    const handleLeaveCancel = () => {
        TrueSheet.dismiss(LEAVE_BUNDLE_SHEET_NAME);
    };

    // Private bundles become inaccessible once we leave, so drop the cached
    // preview words entirely; for public/friends bundles, seed the cache
    // with the words we already had locally to avoid an extra fetch.
    const syncBundleWordsQueryCacheAfterLeaving = () => {
        if (bundle?.visibility === 'private') {
            queryClient.removeQueries({ queryKey: ['bundleWords', bundleId] });
        } else {
            queryClient.setQueriesData({ queryKey: ['bundleWords', bundleId] }, () =>
                langWords.filter(word => word.bundleId === bundleId),
            );
        }
    };

    const handleLeaveConfirm = () => {
        TrueSheet.dismissAll();
        if (!membership) return;

        syncBundleWordsQueryCacheAfterLeaving();
        editBundleMember({ id: membership.id, removed: true });
        onBundleLeft();
    };

    return (
        <>
            <GenericBottomSheet
                secondaryActionLabel={t('cancel')}
                sheetName={sheetName}
                style={styles.content}
                onSecondaryButtonPress={() => TrueSheet.dismiss(sheetName)}
            >
                {isOwner ? (
                    <>
                        <LibraryItem
                            color={palette.blue}
                            icon="pencil"
                            index={0}
                            label={t('bundle_details.options.edit_title_or_description')}
                            onPress={handleEditPress}
                        />
                        <LibraryItem
                            color={palette.purple}
                            icon="eye"
                            index={1}
                            label={t('bundle_details.options.change_visibility')}
                            onPress={handleVisibilityPress}
                        />
                        <LibraryItem
                            color={palette.green}
                            icon="share-outline"
                            index={2}
                            label={t('bundle_details.options.share_bundle')}
                            onPress={handleSharePress}
                        />
                        <LibraryItem
                            color={palette.red}
                            icon="trash"
                            index={3}
                            label={t('bundle_details.options.delete_bundle')}
                            onPress={handleDeletePress}
                        />
                    </>
                ) : (
                    <>
                        <LibraryItem
                            color={palette.green}
                            icon="share-outline"
                            index={0}
                            label={t('bundle_details.options.share_bundle_link')}
                            onPress={handleShareBundleLinkPress}
                        />
                        <LibraryItem
                            color={palette.red}
                            icon="exit-outline"
                            index={1}
                            label={t('bundle_details.options.leave_bundle')}
                            onPress={handleLeavePress}
                        />
                    </>
                )}
            </GenericBottomSheet>
            <HandleBundleBottomSheet
                bundleId={bundleId}
                sheetName={EDIT_BUNDLE_SHEET_NAME}
                onBundleCreated={() => {}}
            />
            <VisibilityBottomSheet bundleId={bundleId} sheetName={VISIBILITY_SHEET_NAME} />
            <RemoveBundleBottomSheet
                sheetName={REMOVE_BUNDLE_SHEET_NAME}
                onCancel={handleRemoveCancel}
                onRemove={handleRemoveConfirm}
            />
            <LeaveBundleBottomSheet
                sheetName={LEAVE_BUNDLE_SHEET_NAME}
                onCancel={handleLeaveCancel}
                onLeave={handleLeaveConfirm}
            />
            <ShareBundleBottomSheet
                bundleId={bundleId}
                bundleTitle={bundle?.title}
                isPublic={bundle?.visibility !== 'private'}
                sheetName={SHARE_BUNDLE_SHEET_NAME}
            />
        </>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: MARGIN_VERTICAL / 2,
    },
});
