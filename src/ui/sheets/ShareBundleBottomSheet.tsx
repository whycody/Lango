import { useState } from 'react';
import { Share, StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { MARGIN_VERTICAL } from '../../constants/margins';
import { palette } from '../../constants/palette';
import { useWordsBundle } from '../../store';
import { BundleMemberRole } from '../../types';
import { LibraryItem } from '../components/library';
import { GenericBottomSheet } from './GenericBottomSheet';

type InviteRole = Extract<BundleMemberRole, 'editor' | 'viewer'>;

type ShareBundleBottomSheetProps = {
    bundleId?: string;
    bundleTitle?: string;
    isPublic: boolean;
    sheetName: string;
};

const buildBundleLink = (bundleId: string, lang: string) =>
    `${process.env.SITE_URL}/bundle/${bundleId}?lang=${lang}`;

export const ShareBundleBottomSheet = ({
    bundleId,
    bundleTitle,
    isPublic,
    sheetName,
}: ShareBundleBottomSheetProps) => {
    const { i18n, t } = useTranslation();
    const { generateInvitationCode } = useWordsBundle();
    const [generatingRole, setGeneratingRole] = useState<InviteRole | undefined>(undefined);

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
                    link: `${buildBundleLink(bundleId, i18n.language)}&code=${joinCode.code}`,
                    title: bundleTitle,
                }),
            });
        } finally {
            setGeneratingRole(undefined);
        }
    };

    return (
        <GenericBottomSheet
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.content}
            onSecondaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            {!isPublic && (
                <LibraryItem
                    color={palette.purple}
                    description={t('bundle_details.share_sheet.invite_viewer_desc')}
                    icon="eye"
                    index={0}
                    label={t('bundle_details.share_sheet.invite_viewer')}
                    onPress={() => handleInvite('viewer')}
                />
            )}
            <LibraryItem
                color={palette.blue}
                description={t('bundle_details.share_sheet.invite_editor_desc')}
                icon="pencil"
                index={isPublic ? 0 : 1}
                label={t('bundle_details.share_sheet.invite_editor')}
                onPress={() => handleInvite('editor')}
            />
            <LibraryItem
                color={palette.green}
                icon="share-outline"
                index={isPublic ? 1 : 2}
                label={t('bundle_details.share_sheet.share_bundle_link')}
                onPress={handleShareBundleLink}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: MARGIN_VERTICAL / 2,
    },
});
