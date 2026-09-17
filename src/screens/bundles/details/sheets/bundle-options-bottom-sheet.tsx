import { FC } from 'react';
import { Share, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { spacing } from '../../../../constants/margins';
import { palette } from '../../../../constants/palette';
import { useWords, useWordsBundle } from '../../../../store';
import { LibraryItem } from '../../../../ui/components/library';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { buildBundleLink } from '../../../../utils/helpers';
import { HandleBundleBottomSheet } from '../../common/sheets';
import {
    EDIT_BUNDLE_SHEET_NAME,
    LEAVE_BUNDLE_SHEET_NAME,
    REMOVE_BUNDLE_SHEET_NAME,
    SHARE_BUNDLE_SHEET_NAME,
    UNKNOWN_DELETE_BUNDLE_ERROR_RESULT,
    VISIBILITY_SHEET_NAME,
} from '../constants';
import { LeaveBundleBottomSheet } from './leave-bundle-bottom-sheet';
import { RemoveBundleBottomSheet } from './remove-bundle-bottom-sheet';
import { ShareBundleBottomSheet } from './share-bundle-bottom-sheet';
import { VisibilityBottomSheet } from './visibility-bottom-sheet';

interface BundleOptionsBottomSheetProps {
    bundleId?: string;
    isOwner: boolean;
    sheetName: string;
    onBundleRemoved: () => void;
    onBundleLeft: () => void;
}

export const BundleOptionsBottomSheet: FC<BundleOptionsBottomSheetProps> = ({
    bundleId,
    isOwner,
    onBundleLeft,
    onBundleRemoved,
    sheetName,
}) => {
    const { bundles, editBundleMember, removeBundle } = useWordsBundle();
    const { i18n, t } = useTranslation();
    const queryClient = useQueryClient();

    const { langWords } = useWords();
    const bundle = bundles.find(b => b.id === bundleId);
    const membership = bundle?.membership;

    const makePresentSheetHandler = (name: string) => () => {
        TrueSheet.present(name);
    };

    const handleShareBundleLinkPress = () => {
        if (!bundleId || !bundle) return;

        Share.share({
            message: t('bundle_details.share_sheet.share_bundle_link_message', {
                link: buildBundleLink(bundleId, i18n.language),
                title: bundle.title,
            }),
        });
    };

    const handleRemoveCancel = () => {
        TrueSheet.dismiss(REMOVE_BUNDLE_SHEET_NAME);
    };

    const handleRemoveConfirm = async () => {
        if (!bundleId) return UNKNOWN_DELETE_BUNDLE_ERROR_RESULT;
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

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    const isPublic = bundle?.visibility !== 'private';

    return (
        <>
            <GenericBottomSheet
                secondaryActionLabelTx="cancel"
                sheetName={sheetName}
                style={styles.content}
                onSecondaryButtonPress={handleSecondaryButtonPress}
            >
                {isOwner ? (
                    <>
                        <LibraryItem
                            color={palette.blue}
                            icon="pencil"
                            index={0}
                            labelTx="bundle_details.options.edit_title_or_description"
                            onPress={makePresentSheetHandler(EDIT_BUNDLE_SHEET_NAME)}
                        />
                        <LibraryItem
                            color={palette.purple}
                            icon="eye"
                            index={1}
                            labelTx="bundle_details.options.change_visibility"
                            onPress={makePresentSheetHandler(VISIBILITY_SHEET_NAME)}
                        />
                        <LibraryItem
                            color={palette.green}
                            icon="share-outline"
                            index={2}
                            labelTx="bundle_details.options.share_bundle"
                            onPress={makePresentSheetHandler(SHARE_BUNDLE_SHEET_NAME)}
                        />
                        <LibraryItem
                            color={palette.red}
                            icon="trash"
                            index={3}
                            labelTx="bundle_details.options.delete_bundle"
                            onPress={makePresentSheetHandler(REMOVE_BUNDLE_SHEET_NAME)}
                        />
                    </>
                ) : (
                    <>
                        <LibraryItem
                            color={palette.green}
                            icon="share-outline"
                            index={0}
                            labelTx="bundle_details.options.share_bundle_link"
                            onPress={handleShareBundleLinkPress}
                        />
                        <LibraryItem
                            color={palette.red}
                            icon="exit-outline"
                            index={1}
                            labelTx="bundle_details.options.leave_bundle"
                            onPress={makePresentSheetHandler(LEAVE_BUNDLE_SHEET_NAME)}
                        />
                    </>
                )}
            </GenericBottomSheet>
            <HandleBundleBottomSheet bundleId={bundleId} sheetName={EDIT_BUNDLE_SHEET_NAME} />
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
                isPublic={isPublic}
                sheetName={SHARE_BUNDLE_SHEET_NAME}
            />
        </>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: spacing.l,
    },
});
