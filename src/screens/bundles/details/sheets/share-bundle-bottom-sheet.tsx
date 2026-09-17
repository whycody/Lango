import { FC, useState } from 'react';
import { Share, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { spacing } from '../../../../constants/margins';
import { palette } from '../../../../constants/palette';
import { useWordsBundle } from '../../../../store';
import { LibraryItem } from '../../../../ui/components/library';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { buildBundleLink } from '../../../../utils/helpers';
import { InviteRole } from '../types';

interface ShareBundleBottomSheetProps {
    bundleId?: string;
    bundleTitle?: string;
    isPublic: boolean;
    sheetName: string;
}

export const ShareBundleBottomSheet: FC<ShareBundleBottomSheetProps> = ({
    bundleId,
    bundleTitle,
    isPublic,
    sheetName,
}) => {
    const { i18n, t } = useTranslation();
    const { generateInvitationCode } = useWordsBundle();
    const [generatingRole, setGeneratingRole] = useState<InviteRole | null>(null);

    const handleShareBundleLink = () => {
        if (!bundleId || !bundleTitle) return;

        TrueSheet.dismissAll();
        Share.share({
            message: t('bundle_details.share_sheet.share_bundle_link_message', {
                link: buildBundleLink(bundleId, i18n.language),
                title: bundleTitle,
            }),
        });
    };

    const handleInvite = async (role: InviteRole) => {
        if (!bundleId || !bundleTitle || generatingRole) return;

        setGeneratingRole(role);
        try {
            const joinCode = await generateInvitationCode(bundleId, role);
            if (!joinCode) return;

            TrueSheet.dismissAll();
            Share.share({
                message: t('bundle_details.share_sheet.invite_message', {
                    code: joinCode.code,
                    link: buildBundleLink(bundleId, i18n.language, joinCode.code),
                    title: bundleTitle,
                }),
            });
        } finally {
            setGeneratingRole(null);
        }
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            style={styles.content}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            {!isPublic && (
                <LibraryItem
                    color={palette.purple}
                    descriptionTx="bundle_details.share_sheet.invite_viewer_desc"
                    icon="eye"
                    index={0}
                    labelTx="bundle_details.share_sheet.invite_viewer"
                    onPress={() => handleInvite('viewer')}
                />
            )}
            <LibraryItem
                color={palette.blue}
                descriptionTx="bundle_details.share_sheet.invite_editor_desc"
                icon="pencil"
                index={isPublic ? 0 : 1}
                labelTx="bundle_details.share_sheet.invite_editor"
                onPress={() => handleInvite('editor')}
            />
            <LibraryItem
                color={palette.green}
                icon="share-outline"
                index={isPublic ? 1 : 2}
                labelTx="bundle_details.share_sheet.share_bundle_link"
                onPress={handleShareBundleLink}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: spacing.l,
    },
});
