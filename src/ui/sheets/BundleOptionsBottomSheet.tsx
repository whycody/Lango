import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../constants/margins';
import { palette } from '../../constants/palette';
import { useWordsBundle } from '../../store';
import { LibraryItem } from '../components/library';
import { GenericBottomSheet } from './GenericBottomSheet';
import { HandleBundleBottomSheet } from './HandleBundleBottomSheet';
import { LeaveBundleBottomSheet } from './LeaveBundleBottomSheet';
import { RemoveBundleBottomSheet } from './RemoveBundleBottomSheet';
import { VisibilityBottomSheet } from './VisibilityBottomSheet';

const EDIT_BUNDLE_SHEET_NAME = 'bundle-options-edit-bundle-sheet';
const VISIBILITY_SHEET_NAME = 'bundle-options-visibility-sheet';
const REMOVE_BUNDLE_SHEET_NAME = 'bundle-options-remove-bundle-sheet';
const LEAVE_BUNDLE_SHEET_NAME = 'bundle-options-leave-bundle-sheet';

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
    const { t } = useTranslation();

    const membership = bundles.find(b => b.id === bundleId)?.membership;

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

    const handleLeaveConfirm = () => {
        TrueSheet.dismissAll();
        if (!membership) return;
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
                            color={palette.red}
                            icon="trash"
                            index={2}
                            label={t('bundle_details.options.delete_bundle')}
                            onPress={handleDeletePress}
                        />
                    </>
                ) : (
                    <LibraryItem
                        color={palette.red}
                        icon="exit-outline"
                        index={0}
                        label={t('bundle_details.options.leave_bundle')}
                        onPress={handleLeavePress}
                    />
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
        </>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: MARGIN_VERTICAL / 2,
    },
});
