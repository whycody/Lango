import { Share } from 'react-native';
import { useTranslation } from 'react-i18next';

import { buildBundleLink } from '../../../../utils/helpers';

export const useShareBundleLink = () => {
    const { i18n, t } = useTranslation();

    const shareBundleLink = (bundleId: string, bundleTitle?: string) => {
        const link = buildBundleLink(bundleId, i18n.language);

        Share.share({
            message: bundleTitle
                ? t('bundle_details.share_sheet.share_bundle_link_message', {
                      link,
                      title: bundleTitle,
                  })
                : link,
        });
    };

    const shareBundleInvite = (bundleId: string, bundleTitle: string, inviteCode: string) => {
        Share.share({
            message: t('bundle_details.share_sheet.invite_message', {
                code: inviteCode,
                link: buildBundleLink(bundleId, i18n.language, inviteCode),
                title: bundleTitle,
            }),
        });
    };

    return { shareBundleInvite, shareBundleLink };
};
